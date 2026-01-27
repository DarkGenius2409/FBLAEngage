import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ThumbsUp, MessageSquare, Share2, FileText } from 'lucide-react';
import { usePostLikes, usePostComments } from '@/hooks';
import { formatDistanceToNow } from 'date-fns';
import { CommentsSection } from './CommentsSection';
import type { PostWithRelations } from '@/lib/models';

interface PostCardProps {
  post: PostWithRelations;
  currentUserId: string | null;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const { isLiked, toggleLike, likeCount } = usePostLikes(post.id);
  const { commentCount } = usePostComments(post.id);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    if (!currentUserId) return;
    await toggleLike(currentUserId);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const liked = currentUserId ? isLiked(currentUserId) : false;

  return (
    <Card className="overflow-hidden">
      {/* Post Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center rounded-full text-sm">
            {post.author ? getInitials(post.author.name) : 'U'}
          </Avatar>
          <div className="flex-1">
            <h4 className="text-sm font-semibold">{post.author?.name || 'Unknown'}</h4>
            <p className="text-xs text-muted-foreground">
              {post.author?.school_roles?.[0]?.role || 'Member'}
              {post.author?.school?.name ? ` • ${post.author.school.name}` : ''}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{formatTime(post.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-sm whitespace-pre-line">{post.content}</p>
      </div>

      {/* Post Media */}
      {post.media && post.media.length > 0 && (
        <div className="px-4 pb-3 space-y-2">
          {post.media.map((media) => (
            <div key={media.id}>
              {media.type === 'image' && (
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src={media.url}
                    alt="Post media"
                    className="w-full h-auto max-h-96 object-cover"
                  />
                </div>
              )}
              {media.type === 'video' && (
                <div className="rounded-lg overflow-hidden border">
                  <video
                    src={media.url}
                    controls
                    className="w-full h-auto max-h-96"
                  />
                </div>
              )}
              {media.type === 'document' && (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{media.name || 'Document'}</p>
                    <p className="text-xs text-muted-foreground">Document</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={media.url} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Engagement Stats */}
      <div className="px-4 pb-3 flex items-center justify-between text-xs text-muted-foreground">
        <button className="hover:underline">{likeCount} likes</button>
        <div className="flex gap-3">
          <button className="hover:underline" onClick={() => setShowComments(!showComments)}>
            {commentCount} comments
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t px-2 py-1 flex items-center justify-around">
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-2 text-xs h-9 ${liked ? 'text-primary' : ''}`}
          onClick={handleLike}
          disabled={!currentUserId}
        >
          <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
          Like
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-xs h-9"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageSquare className="h-4 w-4" />
          Comment
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 text-xs h-9">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t px-4 py-3 bg-muted/30">
          <CommentsSection postId={post.id} currentUserId={currentUserId} />
        </div>
      )}
    </Card>
  );
}
