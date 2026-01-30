// TikTok OAuth Callback Handler
// Exchanges authorization code for access token and stores connection

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';
import { encrypt } from '../_shared/crypto.ts';

const TIKTOK_CLIENT_KEY = Deno.env.get('TIKTOK_CLIENT_KEY') ?? '';
const TIKTOK_CLIENT_SECRET = Deno.env.get('TIKTOK_CLIENT_SECRET') ?? '';
const REDIRECT_URI = Deno.env.get('TIKTOK_REDIRECT_URI') ?? '';
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
    
    // For POST requests (from client with code_verifier)
    let codeVerifier: string | null = null;
    if (req.method === 'POST') {
      const body = await req.json();
      codeVerifier = body.code_verifier;
    }

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
      .eq('platform', 'tiktok')
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
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code,
        ...(codeVerifier ? { code_verifier: codeVerifier } : {}),
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return redirectToApp('error', 'Failed to exchange authorization code');
    }

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('TikTok token error:', tokenData);
      return redirectToApp('error', tokenData.error_description || 'Token exchange failed');
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in || 86400;
    const openId = tokenData.open_id;
    const scopes = tokenData.scope?.split(',') || [];

    // Get user profile info
    const profileResponse = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url,username',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    let username = '';
    let displayName = '';
    let profilePicture = '';

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      if (profileData.data?.user) {
        username = profileData.data.user.username || '';
        displayName = profileData.data.user.display_name || '';
        profilePicture = profileData.data.user.avatar_url || '';
      }
    }

    // Encrypt tokens before storing
    const encryptedAccessToken = await encrypt(accessToken, ENCRYPTION_KEY);
    const encryptedRefreshToken = refreshToken ? await encrypt(refreshToken, ENCRYPTION_KEY) : null;

    // Store connection in database
    const { error: upsertError } = await supabase
      .from('social_connections')
      .upsert({
        student_id: userId,
        platform: 'tiktok',
        platform_user_id: openId,
        username,
        display_name: displayName,
        profile_picture: profilePicture,
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
        scopes,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'student_id,platform',
      });

    if (upsertError) {
      console.error('Error storing connection:', upsertError);
      return redirectToApp('error', 'Failed to store connection');
    }

    return redirectToApp('success', 'tiktok');
  } catch (error) {
    console.error('Error in tiktok-callback:', error);
    return redirectToApp('error', 'Internal server error');
  }
});

function redirectToApp(status: 'success' | 'error', message: string): Response {
  const redirectUrl = `${APP_URL}social-callback?status=${status}&platform=tiktok&message=${encodeURIComponent(message)}`;
  
  // Return HTML that redirects to the app
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Connecting TikTok...</title>
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
          background: #000;
          color: #fff;
        }
        .container {
          text-align: center;
          padding: 40px;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #333;
          border-top-color: #fe2c55;
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
        <p>${status === 'success' ? 'TikTok connected! Redirecting...' : 'Redirecting...'}</p>
      </div>
    </body>
    </html>
  `;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
}
