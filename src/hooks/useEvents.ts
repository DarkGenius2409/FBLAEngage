import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { EventInsert, EventWithRelations } from '@/lib/models';

export function useEvents(level?: 'regional' | 'state' | 'national') {
  const [events, setEvents] = useState<EventWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [level]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('events')
        .select(`
          *,
          organizer:schools!organizer_id(*),
          registrations:event_registrations(*, student:students!student_id(*))
        `)
        .order('start_date', { ascending: true });

      if (level) {
        query = query.eq('level', level);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setEvents((data as EventWithRelations[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch events'));
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: EventInsert) => {
    try {
      const { data, error: createError } = await supabase
        .from('events')
        .insert(eventData)
        .select(`
          *,
          organizer:schools!organizer_id(*)
        `)
        .single();

      if (createError) throw createError;

      if (data) {
        setEvents((prev) => [...prev, data as EventWithRelations]);
      }

      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create event');
      console.error('Error creating event:', err);
      return { data: null, error };
    }
  };

  const registerForEvent = async (eventId: string, studentId: string) => {
    try {
      const { data, error: registerError } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          student_id: studentId,
        })
        .select()
        .single();

      if (registerError) throw registerError;

      // Refresh events to update registration count
      await fetchEvents();

      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to register for event');
      console.error('Error registering for event:', err);
      return { data: null, error };
    }
  };

  const unregisterFromEvent = async (eventId: string, studentId: string) => {
    try {
      const { error: unregisterError } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('student_id', studentId);

      if (unregisterError) throw unregisterError;

      // Refresh events
      await fetchEvents();

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to unregister from event');
      console.error('Error unregistering from event:', err);
      return { error };
    }
  };

  const isRegistered = (eventId: string, studentId: string) => {
    const event = events.find((e) => e.id === eventId);
    return event?.registrations?.some((r) => r.student_id === studentId) || false;
  };

  return {
    events,
    loading,
    error,
    createEvent,
    registerForEvent,
    unregisterFromEvent,
    isRegistered,
    refetch: fetchEvents,
  };
}

export function useEvent(eventId: string | null) {
  const [event, setEvent] = useState<EventWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      setLoading(false);
      return;
    }

    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('events')
        .select(`
          *,
          organizer:schools!organizer_id(*),
          registrations:event_registrations(*, student:students!student_id(*))
        `)
        .eq('id', eventId)
        .single();

      if (fetchError) throw fetchError;

      setEvent(data as EventWithRelations);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch event'));
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    event,
    loading,
    error,
    refetch: fetchEvent,
  };
}
