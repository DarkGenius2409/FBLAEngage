import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2 } from "lucide-react";
import { usePostComments, useStudent } from "@/hooks";
import { formatDistanceToNow } from "date-fns";
import type { CommentWithAuthor } from "@/lib/models";

interface CommentsSectionProps {
  postId: string;
  currentUserId: string | null;
  /** When provided, use these instead of fetching (avoids double fetch when parent already has data) */
  comments?: CommentWithAuthor[];
  loading?: boolean;
  createComment?: (data: {
    content: string;
    author_id: string;
    post_id: string;
  }) => Promise<unknown>;
}

export function CommentsSection({
  postId,
  currentUserId,
  comments: commentsProp,
  loading: loadingProp,
  createComment: createCommentProp,
}: CommentsSectionProps) {
  const navigate = useNavigate();
  const hookData = usePostComments(postId);
  const comments = commentsProp ?? hookData.comments;
  const loading = loadingProp ?? hookData.loading;
  const createComment = createCommentProp ?? hookData.createComment;
  const { student: currentUser } = useStudent(currentUserId);
  const [newComment, setNewComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId || loading) return;

    await createComment({
      content: newComment.trim(),
      author_id: currentUserId,
      post_id: postId,
    });
    setNewComment("");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="space-y-3 mt-4">
      {/* Comments List */}
      {comments.length > 0 && (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  comment.author?.id &&
                  navigate(`/profile/${comment.author.id}`)
                }
                className="flex-shrink-0 rounded-full hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <Avatar className="w-8 h-8 bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {comment.author?.image ? (
                    <>
                      <AvatarImage
                        src={comment.author.image}
                        alt={comment.author.name}
                      />
                      <AvatarFallback delayMs={0}>
                        {comment.author
                          ? getInitials(comment.author.name)
                          : "U"}
                      </AvatarFallback>
                    </>
                  ) : (
                    <span className="flex size-full items-center justify-center text-xs font-medium">
                      {comment.author ? getInitials(comment.author.name) : "U"}
                    </span>
                  )}
                </Avatar>
              </button>
              <div className="flex-1">
                <div className="bg-background rounded-lg p-2">
                  <p className="text-xs font-semibold">
                    {comment.author?.name || "Unknown"}
                  </p>
                  <p className="text-sm mt-0.5">{comment.content}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-2">
                  {formatTime(comment.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment Input */}
      {currentUserId && (
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <Avatar className="w-8 h-8 bg-primary text-primary-foreground text-xs flex-shrink-0 flex items-center justify-center">
            {currentUser?.image ? (
              <>
                <AvatarImage src={currentUser.image} alt={currentUser.name} />
                <AvatarFallback delayMs={0}>
                  {currentUser ? getInitials(currentUser.name) : "U"}
                </AvatarFallback>
              </>
            ) : (
              <span className="flex size-full items-center justify-center text-xs font-medium">
                {currentUser ? getInitials(currentUser.name) : "U"}
              </span>
            )}
          </Avatar>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newComment.trim() || loading}
              className="flex-shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
