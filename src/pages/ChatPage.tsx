import { useState } from 'react';
import { Card } from '@/components/ui/card';
import VideoMeetingPage from '@/pages/VideoMeetingPage';
import { useAuth } from '@/contexts/AuthContext';
import { useChats } from '@/hooks';
import { ChatListItem, ChatView } from '@/components/chat';
import { Spinner } from '@/components/ui/native-spinner';
import { AnimatePresence, motion } from 'framer-motion';

const slideVariants = {
  enter: { x: '100%', opacity: 1 },
  center: { x: 0, opacity: 1 },
  exit: { x: '100%', opacity: 1 },
};

const slideTransition = {
  type: 'tween' as const,
  duration: 0.3,
  ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
};

export default function ChatPage() {
  const { user } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showVideoMeeting, setShowVideoMeeting] = useState(false);

  const { chats, loading: chatsLoading } = useChats(user?.id || null);

  // Chat List (loading state)
  if (chatsLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  return (
    <>
      {/* Main chat list */}
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

      {/* Animated overlay views */}
      <AnimatePresence>
        {selectedChatId && user && (
          <motion.div
            key="chat-view"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="fixed inset-0 z-50"
          >
            <ChatView
              chatId={selectedChatId}
              currentUserId={user.id}
              onBack={() => setSelectedChatId(null)}
              onVideoCall={() => setShowVideoMeeting(true)}
            />
          </motion.div>
        )}

        {showVideoMeeting && (
          <motion.div
            key="video-meeting"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="fixed inset-0 z-50"
          >
            <VideoMeetingPage onClose={() => setShowVideoMeeting(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
