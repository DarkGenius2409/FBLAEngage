import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Chat, ChatInsert, ChatUpdate, ChatWithRelations, Message, MessageInsert, MessageWithAuthor } from '@/lib/models';

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
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert(chatData)
        .select()
        .single();

      if (chatError) throw chatError;

      const participants = participantIds.map((sid) => ({
        chat_id: chat.id,
        student_id: sid,
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

  const deleteChat = async (chatId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (deleteError) throw deleteError;

      await fetchChats();
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete chat');
      console.error('Error deleting chat:', err);
      return { error };
    }
  };

  const addParticipants = async (chatId: string, studentIds: string[]) => {
    try {
      const { data: existing } = await supabase
        .from('chat_participants')
        .select('student_id')
        .eq('chat_id', chatId);

      const existingIds = new Set((existing || []).map((p) => p.student_id));
      const toAdd = studentIds.filter((id) => !existingIds.has(id));

      if (toAdd.length === 0) {
        await fetchChats();
        return { error: null };
      }

      const rows = toAdd.map((sid) => ({ chat_id: chatId, student_id: sid }));

      const { error: insertError } = await supabase
        .from('chat_participants')
        .insert(rows);

      if (insertError) throw insertError;

      await fetchChats();
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add participants');
      console.error('Error adding participants:', err);
      return { error };
    }
  };

  const removeParticipant = async (chatId: string, studentId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('chat_participants')
        .delete()
        .eq('chat_id', chatId)
        .eq('student_id', studentId);

      if (deleteError) throw deleteError;

      await fetchChats();
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to remove participant');
      console.error('Error removing participant:', err);
      return { error };
    }
  };

  const updateChat = async (chatId: string, updates: ChatUpdate) => {
    try {
      const { data, error: updateError } = await supabase
        .from('chats')
        .update(updates)
        .eq('id', chatId)
        .select()
        .single();

      if (updateError) throw updateError;

      await fetchChats();
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update chat');
      console.error('Error updating chat:', err);
      return { data: null, error };
    }
  };

  const findExistingDirectChat = async (otherUserId: string): Promise<Chat | null> => {
    if (!studentId || studentId === otherUserId) return null;

    try {
      const { data: myPart } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('student_id', studentId);

      const chatIds = [...new Set((myPart || []).map((p) => p.chat_id))];
      if (chatIds.length === 0) return null;

      const { data: chatsData } = await supabase
        .from('chats')
        .select(
          `
          id,
          type,
          name,
          image,
          created_by,
          created_at,
          participants:chat_participants(student_id)
        `
        )
        .in('id', chatIds)
        .eq('type', 'direct');

      const chats = (chatsData || []) as (Chat & { participants: { student_id: string }[] })[];
      const found = chats.find((c) => {
        const ids = c.participants.map((p) => p.student_id);
        return ids.length === 2 && ids.includes(studentId) && ids.includes(otherUserId);
      });

      return found
        ? {
            id: found.id,
            type: found.type,
            name: found.name,
            image: found.image,
            created_by: found.created_by,
            created_at: found.created_at,
          }
        : null;
    } catch {
      return null;
    }
  };

  return {
    chats,
    loading,
    error,
    createChat,
    deleteChat,
    updateChat,
    addParticipants,
    removeParticipant,
    findExistingDirectChat,
    refetch: fetchChats,
  };
}

export function useChatMessages(chatId: string | null) {
  const [messages, setMessages] = useState<MessageWithAuthor[]>([]);
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
          async (payload) => {
            // Fetch author data for the new message
            const newMessage = payload.new as Message;
            const { data: authorData } = await supabase
              .from('students')
              .select('*')
              .eq('id', newMessage.author_id)
              .single();
            
            if (authorData) {
              setMessages((prev) => [...prev, { ...newMessage, author: authorData }]);
            } else {
              setMessages((prev) => [...prev, newMessage as MessageWithAuthor]);
            }
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
        .select(`
          *,
          author:students!author_id(*)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setMessages((data || []) as MessageWithAuthor[]);
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
        .select(`
          *,
          author:students!author_id(*)
        `)
        .single();

      if (sendError) throw sendError;

      if (data) {
        setMessages((prev) => [...prev, data as MessageWithAuthor]);
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
