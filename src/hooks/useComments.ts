import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Comment, CommentInsert, CommentWithAuthor } from '@/lib/models';

export function usePostComments(postId: string) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('comments')
        .select(`
          *,
          author:students!author_id(*)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setComments((data as CommentWithAuthor[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch comments'));
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const createComment = async (commentData: CommentInsert) => {
    try {
      const { data, error: createError } = await supabase
        .from('comments')
        .insert(commentData)
        .select(`
          *,
          author:students!author_id(*)
        `)
        .single();

      if (createError) throw createError;

      if (data) {
        setComments((prev) => [...prev, data as CommentWithAuthor]);
      }

      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create comment');
      console.error('Error creating comment:', err);
      return { data: null, error };
    }
  };

  const updateComment = async (commentId: string, updates: Partial<Comment>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('comments')
        .update(updates)
        .eq('id', commentId)
        .select(`
          *,
          author:students!author_id(*)
        `)
        .single();

      if (updateError) throw updateError;

      if (data) {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId ? (data as CommentWithAuthor) : comment
          )
        );
      }

      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update comment');
      console.error('Error updating comment:', err);
      return { data: null, error };
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (deleteError) throw deleteError;

      setComments((prev) => prev.filter((comment) => comment.id !== commentId));

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete comment');
      console.error('Error deleting comment:', err);
      return { error };
    }
  };

  return {
    comments,
    loading,
    error,
    commentCount: comments.length,
    createComment,
    updateComment,
    deleteComment,
    refetch: fetchComments,
  };
}
