import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Chat, ChatInsert, ChatWithRelations, Message, MessageInsert } from '@/lib/models';

export function useChats(studentId: string | null) {
  const [chats, setChats] = useState<ChatWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (studentId) {
      fetchChats();
    }
  }, [studentId]);

  const fetchChats = async () => {
    if (!studentId) return;

    try {
      setLoading(true);
      setError(null);

      // Get all chats where the student is a participant
      const { data: participantData, error: participantError } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('student_id', studentId);

      if (participantError) throw participantError;

      const chatIds = (participantData || []).map((p) => p.chat_id);

      if (chatIds.length === 0) {
        setChats([]);
        setLoading(false);
        return;
      }

      // Fetch chat details with participants and latest messages
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select(`
          *,
          participants:chat_participants(*, student:students!student_id(*)),
          messages:messages(*, author:students!author_id(*))
        `)
        .in('id', chatIds)
        .order('created_at', { ascending: false });

      if (chatsError) throw chatsError;

      // Sort messages within each chat
      const chatsWithSortedMessages = (chatsData as ChatWithRelations[]).map((chat) => ({
        ...chat,
        messages: chat.messages?.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ) || [],
      }));

      setChats(chatsWithSortedMessages);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch chats'));
      console.error('Error fetching chats:', err);
    } finally {
      setLoading(false);
    }
  };

  const createChat = async (chatData: ChatInsert, participantIds: string[]) => {
    try {
      // Create the chat
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert(chatData)
        .select()
        .single();

      if (chatError) throw chatError;

      // Add participants
      const participants = participantIds.map((studentId) => ({
        chat_id: chat.id,
        student_id: studentId,
      }));

      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert(participants);

      if (participantsError) throw participantsError;

      await fetchChats();

      return { data: chat, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create chat');
      console.error('Error creating chat:', err);
      return { data: null, error };
    }
  };

  return {
    chats,
    loading,
    error,
    createChat,
    refetch: fetchChats,
  };
}

export function useChatMessages(chatId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (chatId) {
      fetchMessages();
      // Set up real-time subscription
      const channel = supabase
        .channel(`chat:${chatId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${chatId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [chatId]);

  const fetchMessages = async () => {
    if (!chatId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setMessages(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch messages'));
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageData: MessageInsert) => {
    try {
      const { data, error: sendError } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (sendError) throw sendError;

      if (data) {
        setMessages((prev) => [...prev, data]);
      }

      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send message');
      console.error('Error sending message:', err);
      return { data: null, error };
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages,
  };
}
