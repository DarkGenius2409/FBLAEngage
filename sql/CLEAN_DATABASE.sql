-- WARNING: This script will DELETE ALL DATA from your database
-- Only run this if you want to start completely fresh
-- Make sure you have backups if you need any existing data

-- 1. Disable RLS temporarily (needed to drop policies)
ALTER TABLE IF EXISTS public.chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.media DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.school_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_follows DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.resource_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reports DISABLE ROW LEVEL SECURITY;

-- 2. Drop all policies
DROP POLICY IF EXISTS "Allow public read access on schools" ON public.schools;
DROP POLICY IF EXISTS "Allow public read access on resources" ON public.resources;
DROP POLICY IF EXISTS "Allow public read access on resource_categories" ON public.resource_categories;
DROP POLICY IF EXISTS "Students can view public profiles" ON public.students;
DROP POLICY IF EXISTS "Allow authenticated read access on events" ON public.events;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.students;
DROP POLICY IF EXISTS "Users can view school roles" ON public.school_roles;
DROP POLICY IF EXISTS "Users can insert their own school roles" ON public.school_roles;
DROP POLICY IF EXISTS "Users can update their own school roles" ON public.school_roles;
DROP POLICY IF EXISTS "Users can delete their own school roles" ON public.school_roles;
DROP POLICY IF EXISTS "Users can manage their own event registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Authenticated users can view event registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can manage their own follows" ON public.student_follows;
DROP POLICY IF EXISTS "Users can read their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can manage their own reports" ON public.reports;
DROP POLICY IF EXISTS "Students can read posts from same school" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can view comments on accessible posts" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can view likes on accessible posts" ON public.likes;
DROP POLICY IF EXISTS "Authenticated users can like posts" ON public.likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can view media on accessible posts" ON public.media;
DROP POLICY IF EXISTS "Chat members can view chat and participants" ON public.chats;
DROP POLICY IF EXISTS "Users can view chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can add chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can update chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can remove chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Chat members can read messages" ON public.messages;
DROP POLICY IF EXISTS "Chat members can send messages" ON public.messages;

-- 3. Drop all triggers and functions
DROP TRIGGER IF EXISTS update_school_member_count ON public.students;
DROP TRIGGER IF EXISTS update_post_like_count ON public.likes;
DROP TRIGGER IF EXISTS update_post_comment_count ON public.comments;
DROP TRIGGER IF EXISTS update_student_follower_count ON public.student_follows;
DROP TRIGGER IF EXISTS create_student_profile ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_school_member_count() CASCADE;
DROP FUNCTION IF EXISTS public.update_post_like_count() CASCADE;
DROP FUNCTION IF EXISTS public.update_post_comment_count() CASCADE;
DROP FUNCTION IF EXISTS public.update_student_follower_count() CASCADE;

-- 4. Drop all tables (in reverse order of dependencies)
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.chat_participants CASCADE;
DROP TABLE IF EXISTS public.chats CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.resources CASCADE;
DROP TABLE IF EXISTS public.resource_categories CASCADE;
DROP TABLE IF EXISTS public.event_registrations CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.student_follows CASCADE;
DROP TABLE IF EXISTS public.school_roles CASCADE;
DROP TABLE IF EXISTS public.media CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.schools CASCADE;

-- 5. Drop all custom types
DROP TYPE IF EXISTS public.media_type CASCADE;
DROP TYPE IF EXISTS public.resource_type CASCADE;
DROP TYPE IF EXISTS public.event_level CASCADE;
DROP TYPE IF EXISTS public.chat_type CASCADE;
DROP TYPE IF EXISTS public.report_target_type CASCADE;

-- 6. Drop extensions (optional - only if you want to remove uuid-ossp)
-- DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- Done! Your database is now clean and ready for a fresh schema
