import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Post, PostInsert, PostWithRelations, PostWithFullRelations } from '@/lib/models';

export function usePosts(schoolId?: string | null) {
  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [schoolId]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const query = supabase
        .from('posts')
        .select(`
          *,
          author:students!author_id(*, school:schools(*), school_roles:school_roles(*)),
          media:media(*)
        `)
        .order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setPosts((data as PostWithRelations[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch posts'));
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: PostInsert) => {
    try {
      const { data, error: createError } = await supabase
        .from('posts')
        .insert(postData)
        .select(`
          *,
          author:students!author_id(*, school:schools(*), school_roles:school_roles(*)),
          media:media(*)
        `)
        .single();

      if (createError) throw createError;

      if (data) {
        setPosts((prev) => [data as PostWithRelations, ...prev]);
      }

      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create post');
      console.error('Error creating post:', err);
      return { data: null, error };
    }
  };

  const updatePost = async (postId: string, updates: Partial<Post>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', postId)
        .select(`
          *,
          author:students!author_id(*, school:schools(*), school_roles:school_roles(*)),
          media:media(*)
        `)
        .single();

      if (updateError) throw updateError;

      if (data) {
        setPosts((prev) =>
          prev.map((post) => (post.id === postId ? (data as PostWithRelations) : post))
        );
      }

      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update post');
      console.error('Error updating post:', err);
      return { data: null, error };
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (deleteError) throw deleteError;

      setPosts((prev) => prev.filter((post) => post.id !== postId));

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete post');
      console.error('Error deleting post:', err);
      return { error };
    }
  };

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
    createPost,
    updatePost,
    deletePost,
  };
}

export function usePost(postId: string | null) {
  const [post, setPost] = useState<PostWithFullRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!postId) {
      setPost(null);
      setLoading(false);
      return;
    }

    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    if (!postId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('posts')
        .select(`
          *,
          author:students!author_id(*),
          media:media(*),
          comments:comments(*, author:students!author_id(*)),
          likes:likes(*)
        `)
        .eq('id', postId)
        .single();

      if (fetchError) throw fetchError;

      setPost(data as PostWithFullRelations);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch post'));
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    post,
    loading,
    error,
    refetch: fetchPost,
  };
}
