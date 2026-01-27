-- Additional RLS Policies for FBLA Engage
-- Run this in your Supabase SQL Editor if you're getting RLS errors
-- These policies should already be in schema.sql, but run this if you need to add them separately

-- Drop existing policies if they exist (optional - only if you're updating)
-- DROP POLICY IF EXISTS "Users can view likes on accessible posts" ON public.likes;
-- DROP POLICY IF EXISTS "Users can view comments on accessible posts" ON public.comments;
-- DROP POLICY IF EXISTS "Users can view media on accessible posts" ON public.media;
-- DROP POLICY IF EXISTS "Users can view school roles" ON public.school_roles;
-- DROP POLICY IF EXISTS "Authenticated users can view event registrations" ON public.event_registrations;

-- Add SELECT policy for likes table (allows viewing likes on posts)
CREATE POLICY "Users can view likes on accessible posts" ON public.likes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.posts p
    JOIN public.students post_author ON p.author_id = post_author.id
    JOIN public.students viewer ON viewer.id = auth.uid()
    WHERE p.id = likes.post_id
      AND (post_author.school_id = viewer.school_id OR post_author.school_id IS NULL OR viewer.school_id IS NULL)
  )
);

-- Add SELECT policy for comments (allows viewing comments on accessible posts)
CREATE POLICY "Users can view comments on accessible posts" ON public.comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.posts p
    JOIN public.students post_author ON p.author_id = post_author.id
    JOIN public.students viewer ON viewer.id = auth.uid()
    WHERE p.id = comments.post_id
      AND (post_author.school_id = viewer.school_id OR post_author.school_id IS NULL OR viewer.school_id IS NULL)
  )
);

-- Add SELECT policy for media (allows viewing media on accessible posts)
CREATE POLICY "Users can view media on accessible posts" ON public.media FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.posts p
    JOIN public.students post_author ON p.author_id = post_author.id
    JOIN public.students viewer ON viewer.id = auth.uid()
    WHERE p.id = media.post_id
      AND (post_author.school_id = viewer.school_id OR post_author.school_id IS NULL OR viewer.school_id IS NULL)
  )
);

-- Add SELECT policy for school_roles (allows viewing roles)
CREATE POLICY "Users can view school roles" ON public.school_roles FOR SELECT USING (true);

-- Add SELECT policy for event_registrations (allows viewing who's registered)
CREATE POLICY "Authenticated users can view event registrations" ON public.event_registrations FOR SELECT USING (auth.role() = 'authenticated');
