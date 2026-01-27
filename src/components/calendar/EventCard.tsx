import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { EventWithRelations } from '@/lib/models';

interface EventCardProps {
  event: EventWithRelations;
  onClick: () => void;
}

const levelColors = {
  regional: 'bg-primary',
  state: 'bg-accent',
  national: 'bg-[#b93838]',
};

const levelLabels = {
  regional: 'Regional',
  state: 'State',
  national: 'National',
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const formatEventTime = (startDate: string, endDate: string) => {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  } catch {
    return 'All Day';
  }
};

export function EventCard({ event, onClick }: EventCardProps) {
  return (
    <Card
      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="text-center min-w-[60px]">
          <div className="text-2xl font-medium">{parseISO(event.start_date).getDate()}</div>
          <div className="text-sm text-muted-foreground">
            {monthNames[parseISO(event.start_date).getMonth()].slice(0, 3)}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{event.title}</h4>
            <Badge className={`${levelColors[event.level]} text-white`}>
              {levelLabels[event.level]}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatEventTime(event.start_date, event.end_date)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.location}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
