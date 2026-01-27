-- Fix Chat Policies - Remove Infinite Recursion
-- Run this in Supabase SQL Editor to fix the chat_participants recursion error

-- Drop existing chat policies
DROP POLICY IF EXISTS "Chat members can view chat and participants" ON public.chats;
DROP POLICY IF EXISTS "Chat members can manage participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Chat members can read messages" ON public.messages;
DROP POLICY IF EXISTS "Chat members can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can add chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can update chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can remove chat participants" ON public.chat_participants;

-- Recreate chat policies without recursion
-- Users can view chats they're participants in or created
CREATE POLICY "Chat members can view chat and participants" ON public.chats FOR SELECT USING (
  id IN (SELECT chat_id FROM public.chat_participants WHERE student_id = auth.uid())
  OR created_by = auth.uid()
);

-- Chat participants policies (avoid recursion - only check direct conditions)
-- SELECT: Users can see their own participation records
-- For seeing other participants, we rely on the chats SELECT policy when fetching chats with relations
CREATE POLICY "Users can view chat participants" ON public.chat_participants FOR SELECT USING (
  student_id = auth.uid()
);

-- INSERT: Users can add themselves (chat creators can add via direct SQL if needed)
CREATE POLICY "Users can add chat participants" ON public.chat_participants FOR INSERT WITH CHECK (
  student_id = auth.uid()
);

-- UPDATE: Not typically needed (primary key), but allow if managing own participation
CREATE POLICY "Users can update chat participants" ON public.chat_participants FOR UPDATE USING (
  student_id = auth.uid()
);

-- DELETE: Users can remove themselves
CREATE POLICY "Users can remove chat participants" ON public.chat_participants FOR DELETE USING (
  student_id = auth.uid()
);

-- Messages policies
CREATE POLICY "Chat members can read messages" ON public.messages FOR SELECT USING (
  chat_id IN (SELECT chat_id FROM public.chat_participants WHERE student_id = auth.uid())
  OR chat_id IN (SELECT id FROM public.chats WHERE created_by = auth.uid())
);

CREATE POLICY "Chat members can send messages" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = author_id 
  AND (
    chat_id IN (SELECT chat_id FROM public.chat_participants WHERE student_id = auth.uid())
    OR chat_id IN (SELECT id FROM public.chats WHERE created_by = auth.uid())
  )
);
