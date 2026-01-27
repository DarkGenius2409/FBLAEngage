import { Card } from '@/components/ui/card';
import { parseISO } from 'date-fns';
import type { EventWithRelations } from '@/lib/models';

interface CalendarGridProps {
  currentMonth: Date;
  events: EventWithRelations[];
  onEventClick: (event: EventWithRelations) => void;
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const levelColors = {
  regional: 'bg-primary',
  state: 'bg-accent',
  national: 'bg-[#b93838]',
};

const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  return { daysInMonth, startingDayOfWeek };
};

export function CalendarGrid({ currentMonth, events, onEventClick }: CalendarGridProps) {
  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const getEventsForDay = (day: number) => {
    return events.filter((event) => {
      const eventDate = parseISO(event.start_date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentMonth.getMonth() &&
        eventDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  };

  return (
    <Card className="overflow-hidden">
      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b bg-muted/50">
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-xs font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square border-r border-b border-border bg-muted/30"></div>
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dayEvents = getEventsForDay(day);
          const isToday =
            day === new Date().getDate() &&
            currentMonth.getMonth() === new Date().getMonth() &&
            currentMonth.getFullYear() === new Date().getFullYear();

          return (
            <div
              key={day}
              className="aspect-square border-r border-b border-border p-1 hover:bg-muted/50 transition-colors"
            >
              <div className={`text-sm mb-1 ${isToday ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
                {day}
              </div>
              <div className="space-y-0.5">
                {dayEvents.map(event => (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={`w-full text-left text-[10px] px-1 py-0.5 rounded ${levelColors[event.level]} text-white truncate hover:opacity-80 transition-opacity`}
                  >
                    {event.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
