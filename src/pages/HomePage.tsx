import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts, useStudent } from '@/hooks';
import { PostCard, CreatePostForm } from '@/components/posts';

export default function HomePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const showAddPost = searchParams.get('post') === 'true';

  // Get user's school_id for filtering posts
  const { student } = useStudent(user?.id || null);
  const { posts, loading: postsLoading, refetch } = usePosts(student?.school_id || null);

  const handlePostCreated = async () => {
    await refetch();
    setSearchParams({});
  };

  if (postsLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Create Post */}
      {showAddPost && user && (
        <CreatePostForm
          userId={user.id}
          onPostCreated={handlePostCreated}
          onCancel={() => setSearchParams({})}
        />
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
          </Card>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={user?.id || null} />
          ))
        )}
      </div>
    </div>
  );
}
