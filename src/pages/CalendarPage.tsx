import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useEvents } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { parseISO } from 'date-fns';
import {
  EventModal,
  CalendarGrid,
  EventCard,
  CalendarHeader,
  Legend,
} from '@/components/calendar';

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const { events, loading, registerForEvent, unregisterFromEvent, isRegistered } = useEvents();

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleRegister = async (eventId: string) => {
    if (!user) return;
    const registered = isRegistered(eventId, user.id);
    if (registered) {
      await unregisterFromEvent(eventId, user.id);
    } else {
      await registerForEvent(eventId, user.id);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const upcomingEvents = events
    .filter(event => parseISO(event.start_date) >= new Date())
    .sort((a, b) => parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime())
    .slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isRegistered={user ? isRegistered(selectedEvent.id, user.id) : false}
          onClose={() => setSelectedEvent(null)}
          onRegister={() => {
            handleRegister(selectedEvent.id);
            setSelectedEvent(null);
          }}
        />
      )}

      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={previousMonth}
        onNextMonth={nextMonth}
      />

      <Legend />

      <div className="mb-8">
        <CalendarGrid
          currentMonth={currentMonth}
          events={events}
          onEventClick={setSelectedEvent}
        />
      </div>

      {/* Upcoming Events List */}
      <div className="mt-8">
        <h3 className="text-xl mb-4">Upcoming Events</h3>
        <div className="space-y-3">
          {upcomingEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => setSelectedEvent(event)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
