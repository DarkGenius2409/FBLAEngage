import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Users, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { EventWithRelations } from '@/lib/models';

interface EventModalProps {
  event: EventWithRelations;
  isRegistered: boolean;
  onClose: () => void;
  onRegister: () => void;
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

const formatEventTime = (startDate: string, endDate: string) => {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  } catch {
    return 'All Day';
  }
};

export function EventModal({ event, isRegistered, onClose, onRegister }: EventModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Badge className={`${levelColors[event.level]} text-white mb-3`}>
                {levelLabels[event.level]}
              </Badge>
              <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{format(parseISO(event.start_date), 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatEventTime(event.start_date, event.end_date)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{event.registrations?.length || 0} registered</span>
            </div>
          </div>

          {event.description && (
            <div className="border-t pt-4 mb-4">
              <h3 className="text-sm font-semibold mb-2">About this event</h3>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={onRegister}>
              {isRegistered ? 'Unregister' : 'Register'}
            </Button>
            <Button variant="outline" className="flex-1">
              Add to Calendar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
