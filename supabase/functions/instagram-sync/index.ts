// Instagram Content Sync
// Fetches recent posts from Instagram and imports them to FBLA Engage

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseClient, getSupabaseAdmin } from '../_shared/supabase.ts';
import { decrypt } from '../_shared/crypto.ts';

const ENCRYPTION_KEY = Deno.env.get('OAUTH_ENCRYPTION_KEY') ?? 'default-key-change-me';

interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  permalink: string;
  timestamp: string;
  thumbnail_url?: string;
}

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

    // Get user's Instagram connection
    const { data: connection, error: connError } = await supabaseAdmin
      .from('social_connections')
      .select('*')
      .eq('student_id', user.id)
      .eq('platform', 'instagram')
      .single();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: 'Instagram not connected' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token is expired
    if (new Date(connection.token_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Token expired. Please reconnect Instagram.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decrypt access token
    const accessToken = await decrypt(connection.access_token, ENCRYPTION_KEY);

    // Fetch recent media from Instagram
    const mediaResponse = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp,thumbnail_url&limit=20&access_token=${accessToken}`
    );

    if (!mediaResponse.ok) {
      const errorData = await mediaResponse.text();
      console.error('Failed to fetch Instagram media:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch Instagram posts' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mediaData = await mediaResponse.json();
    const mediaItems: InstagramMedia[] = mediaData.data || [];

    // Get already imported posts
    const { data: existingImports } = await supabaseAdmin
      .from('social_imports')
      .select('platform_post_id')
      .eq('connection_id', connection.id);

    const existingIds = new Set(existingImports?.map(i => i.platform_post_id) || []);

    // Import new posts
    const imported: string[] = [];
    const skipped: string[] = [];

    for (const item of mediaItems) {
      if (existingIds.has(item.id)) {
        skipped.push(item.id);
        continue;
      }

      // Create a new post in FBLA Engage
      const postContent = item.caption || `Shared from Instagram`;
      
      const { data: newPost, error: postError } = await supabaseAdmin
        .from('posts')
        .insert({
          content: postContent,
          author_id: user.id,
        })
        .select('id')
        .single();

      if (postError) {
        console.error('Error creating post:', postError);
        continue;
      }

      // Add media if available
      if (item.media_url && newPost) {
        const mediaUrl = item.media_type === 'VIDEO' && item.thumbnail_url 
          ? item.thumbnail_url 
          : item.media_url;
        
        await supabaseAdmin
          .from('media')
          .insert({
            url: mediaUrl,
            type: item.media_type === 'VIDEO' ? 'video' : 'image',
            post_id: newPost.id,
          });
      }

      // Track the import
      await supabaseAdmin
        .from('social_imports')
        .insert({
          connection_id: connection.id,
          platform_post_id: item.id,
          post_id: newPost?.id,
          media_url: item.media_url,
          caption: item.caption,
          permalink: item.permalink,
          media_type: item.media_type.toLowerCase(),
        });

      imported.push(item.id);
    }

    // Update last synced timestamp
    await supabaseAdmin
      .from('social_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', connection.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        imported: imported.length,
        skipped: skipped.length,
        total: mediaItems.length,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in instagram-sync:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
