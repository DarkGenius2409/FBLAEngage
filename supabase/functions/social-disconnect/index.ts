// Social Media Disconnect
// Removes a social media connection and cleans up related data

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseClient, getSupabaseAdmin } from '../_shared/supabase.ts';

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
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get platform from request body
    const { platform } = await req.json();

    if (!platform || !['instagram', 'tiktok'].includes(platform)) {
      return new Response(
        JSON.stringify({ error: 'Invalid platform' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the connection to find related imports
    const { data: connection, error: connError } = await supabaseAdmin
      .from('social_connections')
      .select('id')
      .eq('student_id', user.id)
      .eq('platform', platform)
      .single();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: 'Connection not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete imports first (cascade should handle this, but explicit is safer)
    await supabaseAdmin
      .from('social_imports')
      .delete()
      .eq('connection_id', connection.id);

    // Delete the connection
    const { error: deleteError } = await supabaseAdmin
      .from('social_connections')
      .delete()
      .eq('id', connection.id);

    if (deleteError) {
      console.error('Error deleting connection:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to disconnect' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // TODO: In production, also revoke the access token with the platform
    // Instagram: DELETE https://graph.instagram.com/me/permissions?access_token=...
    // TikTok: POST https://open.tiktokapis.com/v2/oauth/revoke/

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `${platform} disconnected successfully`,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in social-disconnect:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
