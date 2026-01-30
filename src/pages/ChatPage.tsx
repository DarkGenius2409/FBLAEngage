import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import VideoMeetingPage from '@/pages/VideoMeetingPage';
import { useAuth } from '@/contexts/AuthContext';
import { useChats, useChatRequests, useStudent } from '@/hooks';
import { ChatListItem, ChatRequestListItem, ChatView, UserSearchModal } from '@/components/chat';
import { Spinner } from '@/components/ui/spinner';
import { Separator } from '@/components/ui/separator';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Student } from '@/lib/models';

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
  const location = useLocation();
  const navigate = useNavigate();
  const { student } = useStudent(user?.id || null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [videoCallChatId, setVideoCallChatId] = useState<string | null>(null);
  const [newMessageOpen, setNewMessageOpen] = useState(false);

  useEffect(() => {
    const openChatId = (location.state as { openChatId?: string } | null)?.openChatId;
    if (openChatId) {
      setSelectedChatId(openChatId);
      navigate('/chat', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const {
    chats,
    loading: chatsLoading,
    createChat,
    deleteChat,
    findExistingDirectChat,
    refetch: refetchChats,
  } = useChats(user?.id || null);

  const {
    pendingRequests,
    createRequest,
    acceptRequest,
    declineRequest,
    hasPendingRequestTo,
  } = useChatRequests(user?.id || null);

  const handleVideoCall = (chatId: string) => {
    setVideoCallChatId(chatId);
  };

  const handleCreateChat = async (selected: Student[]) => {
    if (!user?.id) return;

    if (selected.length === 1) {
      const other = selected[0];
      const existing = await findExistingDirectChat(other.id);
      if (existing) {
        setNewMessageOpen(false);
        setSelectedChatId(existing.id);
        return;
      }
      const pending = await hasPendingRequestTo(other.id);
      if (pending) {
        toast.info('Request already sent');
        setNewMessageOpen(false);
        return;
      }
      const { error } = await createRequest(other.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success('Request sent');
      setNewMessageOpen(false);
      return;
    }

    const participantIds = [user.id, ...selected.map((s) => s.id)];
    const type = participantIds.length === 2 ? 'direct' : 'group';
    const { data, error } = await createChat(
      { type, created_by: user.id },
      participantIds
    );
    if (!error && data) {
      setNewMessageOpen(false);
      setSelectedChatId(data.id);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    const { data: chat, error } = await acceptRequest(requestId);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (chat) {
      await refetchChats();
      setSelectedChatId(chat.id);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    await declineRequest(requestId);
  };

  const handleDeleteChat = async (chatId: string) => {
    const { error } = await deleteChat(chatId);
    if (!error && selectedChatId === chatId) {
      setSelectedChatId(null);
    }
  };

  // Chat List (loading state)
  if (chatsLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Spinner className="size-8" />
        <p className="text-sm text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Messages</h2>
          <Button
            size="sm"
            className="min-h-11"
            onClick={() => setNewMessageOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            New message
          </Button>
        </div>
        {pendingRequests.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Message requests</h3>
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <ChatRequestListItem
                  key={req.id}
                  request={req}
                  onAccept={handleAcceptRequest}
                  onDecline={handleDeclineRequest}
                />
              ))}
            </div>
            <Separator variant="gradient" className="my-6" />
          </div>
        )}

        <div className="space-y-3">
          {chats.length === 0 && pendingRequests.length === 0 ? (
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
                onDelete={handleDeleteChat}
              />
            ))
          )}
        </div>
      </div>

      <UserSearchModal
        open={newMessageOpen}
        onOpenChange={setNewMessageOpen}
        excludeIds={user?.id ? [user.id] : []}
        submitLabel="Create DM"
        onSubmit={handleCreateChat}
        title="New message"
      />

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
              onVideoCall={() => handleVideoCall(selectedChatId)}
            />
          </motion.div>
        )}

        {videoCallChatId && user && (
          <motion.div
            key="video-meeting"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="fixed inset-0 z-50"
          >
            <VideoMeetingPage 
              chatId={videoCallChatId}
              userName={student?.name || user.email?.split('@')[0] || 'Guest'}
              userEmail={user.email || ''}
              onClose={() => setVideoCallChatId(null)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
