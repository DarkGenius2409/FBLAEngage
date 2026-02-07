import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow, parseISO } from 'date-fns';
import type { ChatWithRelations } from '@/lib/models';

interface ChatListItemProps {
  chat: ChatWithRelations;
  currentUserId: string;
  onClick: () => void;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export function ChatListItem({ chat, currentUserId, onClick }: ChatListItemProps) {
  const getChatName = () => {
    if (chat.type === 'direct' && chat.participants) {
      const otherParticipant = chat.participants.find((p) => p.student_id !== currentUserId);
      return otherParticipant?.student?.name || 'Unknown';
    }
    return chat.type === 'group' ? 'Group Chat' : 'School Chat';
  };

  const getChatAvatarData = () => {
    if (chat.type === 'direct' && chat.participants) {
      const otherParticipant = chat.participants.find((p) => p.student_id !== currentUserId);
      const name = otherParticipant?.student?.name;
      return {
        initials: name ? getInitials(name) : 'U',
        image: otherParticipant?.student?.image ?? null,
      };
    }
    return { initials: chat.type === 'group' ? 'GC' : 'SC', image: null };
  };

  const getLastMessage = () => {
    if (!chat.messages || chat.messages.length === 0) return 'No messages yet';
    const lastMessage = chat.messages[chat.messages.length - 1];
    return lastMessage.content;
  };

  const getLastMessageTime = () => {
    if (!chat.messages || chat.messages.length === 0) return '';
    const lastMessage = chat.messages[chat.messages.length - 1];
    try {
      return formatDistanceToNow(parseISO(lastMessage.created_at), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const chatAvatarData = getChatAvatarData();

  return (
    <Card
      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors rounded-2xl"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center">
          {chatAvatarData.image ? (
            <AvatarImage src={chatAvatarData.image} alt="" />
          ) : null}
          <AvatarFallback>{chatAvatarData.initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium truncate">{getChatName()}</h3>
            <span className="text-xs text-muted-foreground">{getLastMessageTime()}</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground truncate">{getLastMessage()}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
