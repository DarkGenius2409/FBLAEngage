-- Allow authenticated users to read student_follows so followers/following lists
-- and counts work when viewing other users' profiles.
-- Run this in the Supabase SQL Editor.
CREATE POLICY "Authenticated users can view follow relationships"
  ON public.student_follows
  FOR SELECT
  USING (auth.role() = 'authenticated');
