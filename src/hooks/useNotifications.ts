import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Notification, NotificationInsert, NotificationUpdate } from '@/lib/models';

export function useNotifications(recipientId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (recipientId) {
      fetchNotifications();
      // Set up real-time subscription for new notifications
      const channel = supabase
        .channel(`notifications:${recipientId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${recipientId}`,
          },
          (payload) => {
            setNotifications((prev) => [payload.new as Notification, ...prev]);
            setUnreadCount((prev) => prev + 1);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [recipientId]);

  const fetchNotifications = async () => {
    if (!recipientId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', recipientId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'));
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (updateError) throw updateError;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to mark notification as read');
      console.error('Error marking notification as read:', err);
      return { error };
    }
  };

  const markAllAsRead = async () => {
    if (!recipientId) return { error: new Error('No recipient ID provided') };

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', recipientId)
        .eq('is_read', false);

      if (updateError) throw updateError;

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to mark all as read');
      console.error('Error marking all as read:', err);
      return { error };
    }
  };

  const createNotification = async (notificationData: NotificationInsert) => {
    try {
      const { data, error: createError } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      if (createError) throw createError;

      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create notification');
      console.error('Error creating notification:', err);
      return { data: null, error };
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    createNotification,
    refetch: fetchNotifications,
  };
}
