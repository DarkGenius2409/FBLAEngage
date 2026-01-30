// Instagram OAuth Callback Handler
// Exchanges authorization code for access token and stores connection

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';
import { encrypt } from '../_shared/crypto.ts';

const INSTAGRAM_CLIENT_ID = Deno.env.get('INSTAGRAM_CLIENT_ID') ?? '';
const INSTAGRAM_CLIENT_SECRET = Deno.env.get('INSTAGRAM_CLIENT_SECRET') ?? '';
const REDIRECT_URI = Deno.env.get('INSTAGRAM_REDIRECT_URI') ?? '';
const ENCRYPTION_KEY = Deno.env.get('OAUTH_ENCRYPTION_KEY') ?? 'default-key-change-me';
const APP_URL = Deno.env.get('APP_URL') ?? 'fblaengage://';

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      const errorDescription = url.searchParams.get('error_description') || 'Unknown error';
      return redirectToApp('error', errorDescription);
    }

    if (!code || !state) {
      return redirectToApp('error', 'Missing code or state parameter');
    }

    const supabase = getSupabaseAdmin();

    // Verify state parameter (CSRF protection)
    const { data: stateData, error: stateError } = await supabase
      .from('oauth_states')
      .select('user_id, expires_at')
      .eq('state', state)
      .eq('platform', 'instagram')
      .single();

    if (stateError || !stateData) {
      console.error('Invalid state:', stateError);
      return redirectToApp('error', 'Invalid or expired state');
    }

    // Check if state is expired
    if (new Date(stateData.expires_at) < new Date()) {
      return redirectToApp('error', 'State expired');
    }

    const userId = stateData.user_id;

    // Delete used state
    await supabase
      .from('oauth_states')
      .delete()
      .eq('state', state);

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: INSTAGRAM_CLIENT_ID,
        client_secret: INSTAGRAM_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return redirectToApp('error', 'Failed to exchange authorization code');
    }

    const tokenData = await tokenResponse.json();
    const shortLivedToken = tokenData.access_token;
    const instagramUserId = tokenData.user_id;

    // Exchange short-lived token for long-lived token (60 days)
    const longTokenResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_CLIENT_SECRET}&access_token=${shortLivedToken}`
    );

    let accessToken = shortLivedToken;
    let expiresIn = 3600; // 1 hour default for short-lived

    if (longTokenResponse.ok) {
      const longTokenData = await longTokenResponse.json();
      accessToken = longTokenData.access_token;
      expiresIn = longTokenData.expires_in || 5184000; // 60 days
    }

    // Get user profile info
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
    );

    let username = '';
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      username = profileData.username || '';
    }

    // Encrypt access token before storing
    const encryptedToken = await encrypt(accessToken, ENCRYPTION_KEY);

    // Store connection in database
    const { error: upsertError } = await supabase
      .from('social_connections')
      .upsert({
        student_id: userId,
        platform: 'instagram',
        platform_user_id: instagramUserId.toString(),
        username,
        access_token: encryptedToken,
        token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
        scopes: ['user_profile', 'user_media'],
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'student_id,platform',
      });

    if (upsertError) {
      console.error('Error storing connection:', upsertError);
      return redirectToApp('error', 'Failed to store connection');
    }

    return redirectToApp('success', 'instagram');
  } catch (error) {
    console.error('Error in instagram-callback:', error);
    return redirectToApp('error', 'Internal server error');
  }
});

function redirectToApp(status: 'success' | 'error', message: string): Response {
  const redirectUrl = `${APP_URL}social-callback?status=${status}&platform=instagram&message=${encodeURIComponent(message)}`;
  
  // Return HTML that redirects to the app
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Connecting Instagram...</title>
      <meta http-equiv="refresh" content="0;url=${redirectUrl}">
      <script>
        window.location.href = "${redirectUrl}";
      </script>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background: #f5f5f5;
        }
        .container {
          text-align: center;
          padding: 40px;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e5e5;
          border-top-color: #0a2e4e;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="spinner"></div>
        <p>${status === 'success' ? 'Instagram connected! Redirecting...' : 'Redirecting...'}</p>
      </div>
    </body>
    </html>
  `;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
}
