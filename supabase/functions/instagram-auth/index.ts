// Instagram OAuth Initiation
// Generates the Instagram authorization URL with state parameter for CSRF protection

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';

const INSTAGRAM_CLIENT_ID = Deno.env.get('INSTAGRAM_CLIENT_ID') ?? '';
const REDIRECT_URI = Deno.env.get('INSTAGRAM_REDIRECT_URI') ?? '';

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = getSupabaseClient(authHeader);
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a random state parameter for CSRF protection
    const state = crypto.randomUUID();
    
    // Store state in database temporarily (expires in 10 minutes)
    const { error: stateError } = await supabase
      .from('oauth_states')
      .upsert({
        state,
        user_id: user.id,
        platform: 'instagram',
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });

    if (stateError) {
      console.error('Error storing state:', stateError);
      // Continue anyway - state validation is optional but recommended
    }

    // Build Instagram OAuth URL
    // Using Instagram Basic Display API scopes
    const scopes = ['user_profile', 'user_media'];
    const authUrl = new URL('https://api.instagram.com/oauth/authorize');
    authUrl.searchParams.set('client_id', INSTAGRAM_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('scope', scopes.join(','));
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', state);

    return new Response(
      JSON.stringify({ 
        url: authUrl.toString(),
        state 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in instagram-auth:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
