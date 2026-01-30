-- Add group chat name and image. Run this if you have an existing DB and don't reset from schema.sql.

ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS image text;

DROP POLICY IF EXISTS "Participants can update group chat details" ON public.chats;
CREATE POLICY "Participants can update group chat details" ON public.chats
  FOR UPDATE
  USING (
    id IN (SELECT chat_id FROM public.chat_participants WHERE student_id = auth.uid())
  );
