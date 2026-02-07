import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { ChatRequestWithRequester } from '@/lib/models';

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

export interface ChatRequestListItemProps {
  request: ChatRequestWithRequester;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
}

export function ChatRequestListItem({
  request,
  onAccept,
  onDecline,
}: ChatRequestListItemProps) {
  const name = request.requester?.name ?? 'Someone';
  const initials = request.requester ? getInitials(name) : '?';

  return (
    <Card className="p-5 rounded-2xl border min-h-14 flex flex-col justify-center">
      <div className="flex items-center gap-4">
        <Avatar className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center shrink-0">
          {request.requester?.image ? (
            <AvatarImage src={request.requester.image} alt={name} />
          ) : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{name}</p>
          <p className="text-sm text-muted-foreground">wants to message you</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="min-h-11"
            onClick={() => onDecline(request.id)}
          >
            Decline
          </Button>
          <Button
            size="sm"
            className="min-h-11"
            onClick={() => onAccept(request.id)}
          >
            Accept
          </Button>
        </div>
      </div>
    </Card>
  );
}
