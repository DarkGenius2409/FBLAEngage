-- Chat DM Policies: Create/delete chats, add/remove participants
-- Run after schema + FIX_CHAT_POLICIES. Adds INSERT/DELETE on chats, updates chat_participants.

-- Chats: allow insert (create) and delete (participants)
CREATE POLICY "Users can create chats" ON public.chats
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Participants can delete chats" ON public.chats
  FOR DELETE
  USING (
    id IN (SELECT chat_id FROM public.chat_participants WHERE student_id = auth.uid())
  );

-- Drop existing chat_participants policies we are replacing
DROP POLICY IF EXISTS "Users can view chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can add chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can remove chat participants" ON public.chat_participants;

-- Chat participants: view all participants in chats you belong to (not only own row)
CREATE POLICY "Users can view chat participants" ON public.chat_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_participants cp
      WHERE cp.chat_id = chat_participants.chat_id AND cp.student_id = auth.uid()
    )
  );

-- Chat participants: add members if you are creator or already a participant
CREATE POLICY "Users can add chat participants" ON public.chat_participants
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.chats c WHERE c.id = chat_id AND c.created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM public.chat_participants cp WHERE cp.chat_id = chat_participants.chat_id AND cp.student_id = auth.uid())
  );

-- Chat participants: remove self (leave) or remove any member if you are creator
CREATE POLICY "Users can remove chat participants" ON public.chat_participants
  FOR DELETE
  USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.chats c WHERE c.id = chat_participants.chat_id AND c.created_by = auth.uid())
  );
