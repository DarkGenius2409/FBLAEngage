import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Chat, ChatRequestWithRequester } from '@/lib/models';

export function useChatRequests(currentUserId: string | null) {
  const [pendingRequests, setPendingRequests] = useState<ChatRequestWithRequester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!currentUserId) {
      setPendingRequests([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('chat_requests')
        .select(
          `
          *,
          requester:students!requester_id(id, name, email)
        `
        )
        .eq('recipient_id', currentUserId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setPendingRequests((data as ChatRequestWithRequester[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch requests'));
      setPendingRequests([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const createRequest = async (recipientId: string) => {
    if (!currentUserId || currentUserId === recipientId) {
      return { error: new Error('Invalid recipient') };
    }

    try {
      const { error: insertError } = await supabase.from('chat_requests').insert({
        requester_id: currentUserId,
        recipient_id: recipientId,
        status: 'pending',
      });

      if (insertError) throw insertError;

      await fetchRequests();
      return { error: null };
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to create request');
      console.error('Error creating chat request:', err);
      return { error: e };
    }
  };

  const acceptRequest = async (requestId: string): Promise<{ data: Chat | null; error: Error | null }> => {
    if (!currentUserId) return { data: null, error: new Error('Not authenticated') };

    try {
      const { data: req, error: fetchErr } = await supabase
        .from('chat_requests')
        .select('id, requester_id, recipient_id')
        .eq('id', requestId)
        .eq('recipient_id', currentUserId)
        .eq('status', 'pending')
        .single();

      if (fetchErr || !req) {
        throw fetchErr || new Error('Request not found or already handled');
      }

      const requesterId = req.requester_id as string;
      const recipientId = req.recipient_id as string;

      const { data: chat, error: chatErr } = await supabase
        .from('chats')
        .insert({
          type: 'direct',
          created_by: requesterId,
        })
        .select()
        .single();

      if (chatErr || !chat) throw chatErr || new Error('Failed to create chat');

      const participants = [
        { chat_id: chat.id, student_id: requesterId },
        { chat_id: chat.id, student_id: recipientId },
      ];

      const { error: partsErr } = await supabase.from('chat_participants').insert(participants);
      if (partsErr) throw partsErr;

      const { error: updateErr } = await supabase
        .from('chat_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateErr) throw updateErr;

      await fetchRequests();
      return { data: chat as Chat, error: null };
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to accept request');
      console.error('Error accepting chat request:', err);
      return { data: null, error: e };
    }
  };

  const declineRequest = async (requestId: string) => {
    if (!currentUserId) return { error: new Error('Not authenticated') };

    try {
      const { error: updateErr } = await supabase
        .from('chat_requests')
        .update({ status: 'declined' })
        .eq('id', requestId)
        .eq('recipient_id', currentUserId)
        .eq('status', 'pending');

      if (updateErr) throw updateErr;

      await fetchRequests();
      return { error: null };
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to decline request');
      console.error('Error declining chat request:', err);
      return { error: e };
    }
  };

  const hasPendingRequestTo = async (recipientId: string): Promise<boolean> => {
    if (!currentUserId) return false;

    const { data } = await supabase
      .from('chat_requests')
      .select('id')
      .eq('requester_id', currentUserId)
      .eq('recipient_id', recipientId)
      .eq('status', 'pending')
      .limit(1);

    return (data?.length ?? 0) > 0;
  };

  return {
    pendingRequests,
    loading,
    error,
    createRequest,
    acceptRequest,
    declineRequest,
    hasPendingRequestTo,
    refetch: fetchRequests,
  };
}
