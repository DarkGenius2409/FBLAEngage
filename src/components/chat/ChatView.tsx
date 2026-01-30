import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { ArrowLeft, Send, Video, Phone, MoreVertical, Loader2 } from 'lucide-react';
import { useChatMessages } from '@/hooks';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow, parseISO } from 'date-fns';
import type { ChatWithRelations } from '@/lib/models';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

interface ChatViewProps {
  chatId: string;
  currentUserId: string;
  onBack: () => void;
  onVideoCall: () => void;
}

export function ChatView({ chatId, currentUserId, onBack, onVideoCall }: ChatViewProps) {
  const { messages, loading, sendMessage } = useChatMessages(chatId);
  const [newMessage, setNewMessage] = useState('');
  const [chat, setChat] = useState<ChatWithRelations | null>(null);

  useEffect(() => {
    const fetchChat = async () => {
      const { data } = await supabase
        .from('chats')
        .select(`
          *,
          participants:chat_participants(*, student:students!student_id(*))
        `)
        .eq('id', chatId)
        .single();
      
      if (data) {
        setChat(data as ChatWithRelations);
      }
    };

    if (chatId) {
      fetchChat();
    }
  }, [chatId]);

  const getChatName = () => {
    if (!chat) return 'Chat';
    if (chat.type === 'direct' && chat.participants) {
      const otherParticipant = chat.participants.find((p) => p.student_id !== currentUserId);
      return otherParticipant?.student?.name || 'Unknown';
    }
    if ((chat.type === 'group' || chat.type === 'school') && chat.name) {
      return chat.name;
    }
    return chat.type === 'group' ? 'Group Chat' : 'School Chat';
  };

  const getChatAvatar = () => {
    if (!chat) return 'CH';
    if (chat.type === 'direct' && chat.participants) {
      const otherParticipant = chat.participants.find((p) => p.student_id !== currentUserId);
      return otherParticipant?.student?.name ? getInitials(otherParticipant.student.name) : 'U';
    }
    return chat.type === 'group' ? 'GC' : 'SC';
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    await sendMessage({
      content: newMessage,
      author_id: currentUserId,
      chat_id: chatId,
    });

    setNewMessage('');
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-background">
      {/* Chat Header - Navy with safe area */}
      <div 
        className="border-b border-primary-foreground/10 p-4 flex items-center justify-between bg-primary text-primary-foreground"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10 shrink-0" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="w-10 h-10 bg-white/20 text-primary-foreground flex items-center justify-center shrink-0">
            {getChatAvatar()}
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium truncate">{getChatName()}</h3>
            <p className="text-xs text-primary-foreground/70">Active now</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10" onClick={onVideoCall}>
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 momentum-scroll">
        {messages.map((message) => {
          const isOwn = message.author_id === currentUserId;
          const authorName = message.author?.name || 'Unknown';
          return (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              {!isOwn && (
                <Avatar className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center rounded-full text-xs shrink-0">
                  {getInitials(authorName)}
                </Avatar>
              )}
              <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                {!isOwn && (
                  <p className="text-xs font-medium text-foreground mb-1 px-1">
                    {authorName}
                  </p>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p>{message.content}</p>
                </div>
                <p className={`text-xs text-muted-foreground mt-1 px-2 ${isOwn ? 'text-right' : 'text-left'}`}>
                  {formatTime(message.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message Input */}
      <div 
        className="border-t border-border p-4 bg-background"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
      >
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            className="flex-1"
          />
          <Button
            size="icon"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
