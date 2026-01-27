import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, FileText, DollarSign, MessageSquare } from 'lucide-react';
import type { FBLAEvent } from '@/lib/fblaEvents';

interface EventCardProps {
  event: FBLAEvent;
  resourceCount: number;
  onClick: () => void;
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  'Accounting': <DollarSign className="h-6 w-6" />,
  'Business Plan': <FileText className="h-6 w-6" />,
  'Marketing': <MessageSquare className="h-6 w-6" />,
};

export function EventCard({ event, resourceCount, onClick }: EventCardProps) {
  const eventIcon = EVENT_ICONS[event.name] || <FileText className="h-6 w-6" />;

  return (
    <Card
      className="p-4 cursor-pointer active:scale-[0.98] transition-transform touch-manipulation hover:bg-muted/50"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="bg-accent/20 p-3 rounded-lg flex-shrink-0 text-accent-foreground">
          {eventIcon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base mb-1">{event.name}</h3>
          <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
            {event.category} • Grades {event.eligibleGrades}
          </p>
          <p className="text-xs text-muted-foreground">
            {resourceCount} {resourceCount === 1 ? 'resource' : 'resources'}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
      </div>
    </Card>
  );
}
