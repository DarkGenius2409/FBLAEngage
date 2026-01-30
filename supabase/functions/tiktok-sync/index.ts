// TikTok Content Sync
// Fetches recent videos from TikTok and imports them to FBLA Engage

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseClient, getSupabaseAdmin } from '../_shared/supabase.ts';
import { decrypt } from '../_shared/crypto.ts';

const ENCRYPTION_KEY = Deno.env.get('OAUTH_ENCRYPTION_KEY') ?? 'default-key-change-me';

interface TikTokVideo {
  id: string;
  title?: string;
  cover_image_url?: string;
  share_url: string;
  create_time: number;
  video_description?: string;
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

    // Get user's TikTok connection
    const { data: connection, error: connError } = await supabaseAdmin
      .from('social_connections')
      .select('*')
      .eq('student_id', user.id)
      .eq('platform', 'tiktok')
      .single();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: 'TikTok not connected' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token is expired
    if (new Date(connection.token_expires_at) < new Date()) {
      // TODO: Implement token refresh using refresh_token
      return new Response(
        JSON.stringify({ error: 'Token expired. Please reconnect TikTok.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decrypt access token
    const accessToken = await decrypt(connection.access_token, ENCRYPTION_KEY);

    // Fetch recent videos from TikTok
    const videosResponse = await fetch(
      'https://open.tiktokapis.com/v2/video/list/?fields=id,title,cover_image_url,share_url,create_time,video_description',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          max_count: 20,
        }),
      }
    );

    if (!videosResponse.ok) {
      const errorData = await videosResponse.text();
      console.error('Failed to fetch TikTok videos:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch TikTok videos' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const videosData = await videosResponse.json();
    
    if (videosData.error?.code) {
      console.error('TikTok API error:', videosData.error);
      return new Response(
        JSON.stringify({ error: videosData.error.message || 'TikTok API error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const videos: TikTokVideo[] = videosData.data?.videos || [];

    // Get already imported videos
    const { data: existingImports } = await supabaseAdmin
      .from('social_imports')
      .select('platform_post_id')
      .eq('connection_id', connection.id);

    const existingIds = new Set(existingImports?.map(i => i.platform_post_id) || []);

    // Import new videos
    const imported: string[] = [];
    const skipped: string[] = [];

    for (const video of videos) {
      if (existingIds.has(video.id)) {
        skipped.push(video.id);
        continue;
      }

      // Create a new post in FBLA Engage
      const postContent = video.video_description || video.title || `Shared from TikTok`;
      
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

      // Add thumbnail as media if available
      if (video.cover_image_url && newPost) {
        await supabaseAdmin
          .from('media')
          .insert({
            url: video.cover_image_url,
            type: 'image', // Thumbnail
            post_id: newPost.id,
          });
      }

      // Track the import
      await supabaseAdmin
        .from('social_imports')
        .insert({
          connection_id: connection.id,
          platform_post_id: video.id,
          post_id: newPost?.id,
          media_url: video.cover_image_url,
          caption: video.video_description || video.title,
          permalink: video.share_url,
          media_type: 'video',
        });

      imported.push(video.id);
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
        total: videos.length,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in tiktok-sync:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
