import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Image, Video, FileText, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { PostInsert, MediaInsert } from '@/lib/models';

interface CreatePostFormProps {
  userId: string;
  onPostCreated: () => void;
  onCancel: () => void;
}

export function CreatePostForm({ userId, onPostCreated, onCancel }: CreatePostFormProps) {
  const [newPostContent, setNewPostContent] = useState('');
  const [uploadedMedia, setUploadedMedia] = useState<{
    type: 'image' | 'video' | 'document';
    url: string;
    name?: string;
    file?: File;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    setUploading(true);
    try {
      // Create post
      const postData: PostInsert = {
        content: newPostContent,
        author_id: userId,
      };

      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();

      if (postError) throw postError;

      // Upload media if exists
      if (uploadedMedia && uploadedMedia.file && post) {
        const fileExt = uploadedMedia.file.name.split('.').pop();
        const fileName = `${post.id}/${Date.now()}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, uploadedMedia.file);

        if (uploadError) {
          console.error('Error uploading media:', uploadError);
        } else {
          // Get public URL
          const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);

          // Create media record
          const mediaData: MediaInsert = {
            post_id: post.id,
            url: urlData.publicUrl,
            type: uploadedMedia.type,
            name: uploadedMedia.name,
          };

          await supabase.from('media').insert(mediaData);
        }
      }

      setNewPostContent('');
      setUploadedMedia(null);
      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const type = file.type.startsWith('image')
          ? 'image'
          : file.type.startsWith('video')
          ? 'video'
          : 'document';
        setUploadedMedia({ type, url, name: file.name, file });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="p-4 mb-4">
      <div className="space-y-4">
        <Textarea
          placeholder="What's on your mind?"
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          className="min-h-[100px] resize-none"
          disabled={uploading}
        />

        {/* Media Preview */}
        {uploadedMedia && (
          <div className="relative">
            {uploadedMedia.type === 'image' && (
              <div className="relative rounded-lg overflow-hidden border">
                <img src={uploadedMedia.url} alt="Preview" className="w-full h-auto max-h-64 object-cover" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => setUploadedMedia(null)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {uploadedMedia.type === 'video' && (
              <div className="relative rounded-lg overflow-hidden border">
                <video src={uploadedMedia.url} controls className="w-full h-auto max-h-64" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => setUploadedMedia(null)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {uploadedMedia.type === 'document' && (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted">
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{uploadedMedia.name}</p>
                  <p className="text-xs text-muted-foreground">Document</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setUploadedMedia(null)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Media Upload Buttons */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            className="hidden"
            onChange={handleMediaUpload}
            disabled={uploading}
          />
          <label htmlFor="image-upload">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2"
              asChild
              disabled={uploading}
            >
              <span className="cursor-pointer">
                <Image className="h-4 w-4 text-blue-600" />
                <span className="text-xs">Photo</span>
              </span>
            </Button>
          </label>

          <input
            type="file"
            id="video-upload"
            accept="video/*"
            className="hidden"
            onChange={handleMediaUpload}
            disabled={uploading}
          />
          <label htmlFor="video-upload">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2"
              asChild
              disabled={uploading}
            >
              <span className="cursor-pointer">
                <Video className="h-4 w-4 text-red-600" />
                <span className="text-xs">Video</span>
              </span>
            </Button>
          </label>

          <input
            type="file"
            id="document-upload"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleMediaUpload}
            disabled={uploading}
          />
          <label htmlFor="document-upload">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2"
              asChild
              disabled={uploading}
            >
              <span className="cursor-pointer">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-xs">Document</span>
              </span>
            </Button>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90"
            onClick={handleCreatePost}
            disabled={!newPostContent.trim() || uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Post
          </Button>
        </div>
      </div>
    </Card>
  );
}
