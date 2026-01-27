import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Like, LikeInsert } from '@/lib/models';

export function usePostLikes(postId: string) {
  const [likes, setLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (postId) {
      fetchLikes();
    }
  }, [postId]);

  const fetchLikes = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId);

      if (fetchError) throw fetchError;

      setLikes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch likes'));
      console.error('Error fetching likes:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (userId: string) => {
    try {
      const existingLike = likes.find((like) => like.user_id === userId);

      if (existingLike) {
        // Unlike
        const { error: deleteError } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (deleteError) throw deleteError;

        setLikes((prev) => prev.filter((like) => like.user_id !== userId));
      } else {
        // Like
        const likeData: LikeInsert = {
          post_id: postId,
          user_id: userId,
        };

        const { data, error: insertError } = await supabase
          .from('likes')
          .insert(likeData)
          .select()
          .single();

        if (insertError) throw insertError;

        if (data) {
          setLikes((prev) => [...prev, data]);
        }
      }

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to toggle like');
      console.error('Error toggling like:', err);
      return { error };
    }
  };

  const isLiked = (userId: string) => {
    return likes.some((like) => like.user_id === userId);
  };

  return {
    likes,
    loading,
    error,
    likeCount: likes.length,
    isLiked,
    toggleLike,
    refetch: fetchLikes,
  };
}
