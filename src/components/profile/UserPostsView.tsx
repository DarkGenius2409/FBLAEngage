import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { MobileHeader } from '@/components/resources/MobileHeader';
import { PostCard } from '@/components/posts/PostCard';
import { Spinner } from '@/components/ui/spinner';
import { supabase } from '@/lib/supabase';
import type { PostWithRelations } from '@/lib/models';

interface UserPostsViewProps {
  userId: string;
  onBack: () => void;
}

export function UserPostsView({ userId, onBack }: UserPostsViewProps) {
  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('posts')
          .select(`
            *,
            author:students!posts_author_id_fkey (
              id,
              name,
              image,
              school:schools (
                id,
                name
              ),
              school_roles (
                role
              )
            ),
            media (
              id,
              url,
              type,
              name
            )
          `)
          .eq('author_id', userId)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        setPosts(data || []);
      } catch (err) {
        console.error('Error fetching user posts:', err);
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userId]);

  return (
    <div className="absolute inset-0 bg-background flex flex-col">
      <MobileHeader 
        title="My Posts" 
        subtitle={`${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`}
        onBack={onBack} 
      />

      <div className="flex-1 overflow-y-auto momentum-scroll">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
            <Spinner className="size-8" />
            <p className="text-sm text-muted-foreground">Loading posts...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 px-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No posts yet</h3>
              <p className="text-sm text-muted-foreground">
                Share your FBLA journey with your chapter!
              </p>
            </div>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-4">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                currentUserId={userId} 
              />
            ))}
            <div className="h-4" />
          </div>
        )}
      </div>
    </div>
  );
}
