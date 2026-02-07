-- Enable Supabase Realtime for student_follows so followers/following lists update in real time
-- Run this in the Supabase SQL Editor if lists don't update when users follow/unfollow
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_follows;
