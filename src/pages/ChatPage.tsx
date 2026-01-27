import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import VideoMeetingPage from '@/pages/VideoMeetingPage';
import { useAuth } from '@/contexts/AuthContext';
import { useChats } from '@/hooks';
import { ChatListItem, ChatView } from '@/components/chat';

export default function ChatPage() {
  const { user } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showVideoMeeting, setShowVideoMeeting] = useState(false);

  const { chats, loading: chatsLoading } = useChats(user?.id || null);

  if (showVideoMeeting) {
    return <VideoMeetingPage onClose={() => setShowVideoMeeting(false)} />;
  }

  if (selectedChatId && user) {
    return (
      <ChatView
        chatId={selectedChatId}
        currentUserId={user.id}
        onBack={() => setSelectedChatId(null)}
        onVideoCall={() => setShowVideoMeeting(true)}
      />
    );
  }

  // Chat List
  if (chatsLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h2 className="text-2xl mb-4">Messages</h2>
      <div className="space-y-2">
        {chats.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No messages yet. Start a conversation!</p>
          </Card>
        ) : (
          chats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              currentUserId={user?.id || ''}
              onClick={() => setSelectedChatId(chat.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
