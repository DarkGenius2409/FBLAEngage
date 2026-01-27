import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { ArrowLeft, Send, Video, Phone, MoreVertical, Loader2 } from 'lucide-react';
import { useChatMessages } from '@/hooks';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface ChatViewProps {
  chatId: string;
  currentUserId: string;
  onBack: () => void;
  onVideoCall: () => void;
}

export function ChatView({ chatId, currentUserId, onBack, onVideoCall }: ChatViewProps) {
  const { messages, loading, sendMessage } = useChatMessages(chatId);
  const [newMessage, setNewMessage] = useState('');

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
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white mobile-viewport-fix">
      {/* Chat Header */}
      <div className="border-b border-border p-4 flex items-center justify-between bg-white safe-area-top">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center">
            CH
          </Avatar>
          <div>
            <h3 className="font-medium">Chat</h3>
            <p className="text-xs text-muted-foreground">Active now</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onVideoCall}>
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 momentum-scroll">
        {messages.map((message) => {
          const isOwn = message.author_id === currentUserId;
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
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
      <div className="border-t border-border p-4 bg-white safe-area-bottom">
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
            className="bg-primary hover:bg-blue-800 text-primary-foreground"
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
