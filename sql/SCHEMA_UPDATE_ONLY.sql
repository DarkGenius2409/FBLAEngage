-- FBLA Engage Schema Update (Safe for existing databases)
-- This file only adds missing policies and doesn't recreate existing objects
-- Run this if you already have the tables and just need to add missing policies

-- Add missing SELECT policies (only if they don't exist)
DO $$
BEGIN
  -- Likes SELECT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'likes' 
    AND policyname = 'Users can view likes on accessible posts'
  ) THEN
    CREATE POLICY "Users can view likes on accessible posts" ON public.likes FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.posts p
        JOIN public.students post_author ON p.author_id = post_author.id
        JOIN public.students viewer ON viewer.id = auth.uid()
        WHERE p.id = likes.post_id
          AND (post_author.school_id = viewer.school_id OR post_author.school_id IS NULL OR viewer.school_id IS NULL)
      )
    );
  END IF;

  -- Comments SELECT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'comments' 
    AND policyname = 'Users can view comments on accessible posts'
  ) THEN
    CREATE POLICY "Users can view comments on accessible posts" ON public.comments FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.posts p
        JOIN public.students post_author ON p.author_id = post_author.id
        JOIN public.students viewer ON viewer.id = auth.uid()
        WHERE p.id = comments.post_id
          AND (post_author.school_id = viewer.school_id OR post_author.school_id IS NULL OR viewer.school_id IS NULL)
      )
    );
  END IF;

  -- Media SELECT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'media' 
    AND policyname = 'Users can view media on accessible posts'
  ) THEN
    CREATE POLICY "Users can view media on accessible posts" ON public.media FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.posts p
        JOIN public.students post_author ON p.author_id = post_author.id
        JOIN public.students viewer ON viewer.id = auth.uid()
        WHERE p.id = media.post_id
          AND (post_author.school_id = viewer.school_id OR post_author.school_id IS NULL OR viewer.school_id IS NULL)
      )
    );
  END IF;

  -- School roles SELECT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'school_roles' 
    AND policyname = 'Users can view school roles'
  ) THEN
    CREATE POLICY "Users can view school roles" ON public.school_roles FOR SELECT USING (true);
  END IF;

  -- Event registrations SELECT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'event_registrations' 
    AND policyname = 'Authenticated users can view event registrations'
  ) THEN
    CREATE POLICY "Authenticated users can view event registrations" ON public.event_registrations FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END $$;
