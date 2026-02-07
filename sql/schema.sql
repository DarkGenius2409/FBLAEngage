-- FBLA Engage Supabase Schema (Consolidated)
--
-- Run this file in the Supabase SQL Editor to fully reset and recreate the database.
-- Part 1 drops all public tables, functions, and types. Part 2 recreates everything.
--
-- Includes: base schema, chat DM policies (create/delete chats, add/remove members),
-- social connections (OAuth for Instagram/TikTok), and all prior migrations.
--
-- Other sql/*.sql files (CHAT_DM_POLICIES, SOCIAL_CONNECTIONS_SCHEMA, etc.) are
-- superseded by this file for reset purposes; keep them only for reference.

-- =============================================================================
-- PART 1: CLEAN (drop existing objects)
-- Dropping tables CASCADE removes their triggers and policies.
-- =============================================================================

-- Trigger on auth.users (must be dropped explicitly; not tied to public tables)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop tables (reverse dependency order). CASCADE drops triggers and policies.
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.social_imports CASCADE;
DROP TABLE IF EXISTS public.social_connections CASCADE;
DROP TABLE IF EXISTS public.oauth_states CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.chat_participants CASCADE;
DROP TABLE IF EXISTS public.chats CASCADE;
DROP TABLE IF EXISTS public.chat_requests CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.media CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.event_registrations CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.student_follows CASCADE;
DROP TABLE IF EXISTS public.school_roles CASCADE;
DROP TABLE IF EXISTS public.resources CASCADE;
DROP TABLE IF EXISTS public.resource_categories CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.schools CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.get_my_chat_ids() CASCADE;
DROP FUNCTION IF EXISTS public.update_social_connection_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_post_like_count() CASCADE;
DROP FUNCTION IF EXISTS public.update_post_comment_count() CASCADE;
DROP FUNCTION IF EXISTS public.update_school_member_count() CASCADE;
DROP FUNCTION IF EXISTS public.update_follow_counts() CASCADE;

-- Drop types
DROP TYPE IF EXISTS public.media_type CASCADE;
DROP TYPE IF EXISTS public.resource_type CASCADE;
DROP TYPE IF EXISTS public.event_level CASCADE;
DROP TYPE IF EXISTS public.chat_type CASCADE;
DROP TYPE IF EXISTS public.report_target_type CASCADE;

-- =============================================================================
-- PART 2: CREATE (extensions, types, tables, functions, triggers, RLS, indexes)
-- =============================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM types
DO $$ BEGIN
  CREATE TYPE "public"."media_type" AS ENUM ('image', 'video', 'document');
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  CREATE TYPE "public"."resource_type" AS ENUM ('pdf', 'link', 'video');
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  CREATE TYPE "public"."event_level" AS ENUM ('regional', 'state', 'national');
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  CREATE TYPE "public"."chat_type" AS ENUM ('direct', 'group', 'school');
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  CREATE TYPE "public"."report_target_type" AS ENUM ('post', 'comment', 'student');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 3. Tables

CREATE TABLE "public"."schools" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "name" text NOT NULL,
    "address" text,
    "city" text,
    "state" text,
    "zip" text,
    "email" text UNIQUE,
    "image" text,
    "banner" text,
    "member_count" integer DEFAULT 0,
    "established_at" timestamp with time zone,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."students" (
    "id" uuid NOT NULL,
    "name" text NOT NULL,
    "email" text NOT NULL UNIQUE,
    "school_id" uuid,
    "bio" text,
    "image" text,
    "banner" text,
    "awards" jsonb DEFAULT '[]'::jsonb,
    "interests" jsonb DEFAULT '[]'::jsonb,
    "follower_count" integer DEFAULT 0,
    "following_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE SET NULL
);

CREATE TABLE "public"."school_roles" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "student_id" uuid NOT NULL REFERENCES "public"."students"("id") ON DELETE CASCADE,
    "school_id" uuid NOT NULL REFERENCES "public"."schools"("id") ON DELETE CASCADE,
    "role" text NOT NULL,
    UNIQUE ("student_id", "school_id")
);

CREATE TABLE "public"."events" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "title" text NOT NULL,
    "description" text,
    "image" text,
    "organizer_id" uuid,
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone NOT NULL,
    "location" text NOT NULL,
    "level" event_level NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("organizer_id") REFERENCES "public"."schools"("id") ON DELETE CASCADE
);

CREATE TABLE "public"."event_registrations" (
    "event_id" uuid NOT NULL REFERENCES "public"."events"("id") ON DELETE CASCADE,
    "student_id" uuid NOT NULL REFERENCES "public"."students"("id") ON DELETE CASCADE,
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("event_id", "student_id")
);

CREATE TABLE "public"."posts" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "content" text NOT NULL,
    "author_id" uuid NOT NULL,
    "like_count" integer DEFAULT 0,
    "comment_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("author_id") REFERENCES "public"."students"("id") ON DELETE CASCADE
);

CREATE TABLE "public"."media" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "url" text NOT NULL,
    "type" media_type NOT NULL,
    "name" text,
    "post_id" uuid NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE
);

CREATE TABLE "public"."comments" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "content" text NOT NULL,
    "author_id" uuid NOT NULL,
    "post_id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("author_id") REFERENCES "public"."students"("id") ON DELETE CASCADE,
    FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE
);

CREATE TABLE "public"."likes" (
    "user_id" uuid NOT NULL,
    "post_id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY ("user_id", "post_id"),
    FOREIGN KEY ("user_id") REFERENCES "public"."students"("id") ON DELETE CASCADE,
    FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE
);

CREATE TABLE "public"."student_follows" (
    "follower_id" uuid NOT NULL,
    "following_id" uuid NOT NULL,
    PRIMARY KEY ("follower_id", "following_id"),
    FOREIGN KEY ("follower_id") REFERENCES "public"."students"("id") ON DELETE CASCADE,
    FOREIGN KEY ("following_id") REFERENCES "public"."students"("id") ON DELETE CASCADE,
    CONSTRAINT "no_self_follow" CHECK (follower_id <> following_id)
);

CREATE TABLE "public"."chats" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "type" chat_type DEFAULT 'direct',
    "name" text,
    "image" text,
    "created_by" uuid REFERENCES "public"."students"("id"),
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."chat_participants" (
    "chat_id" uuid NOT NULL REFERENCES "public"."chats"("id") ON DELETE CASCADE,
    "student_id" uuid NOT NULL REFERENCES "public"."students"("id") ON DELETE CASCADE,
    PRIMARY KEY ("chat_id", "student_id")
);

CREATE TABLE "public"."messages" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "content" text NOT NULL,
    "author_id" uuid NOT NULL,
    "chat_id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("author_id") REFERENCES "public"."students"("id") ON DELETE CASCADE,
    FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE CASCADE
);

CREATE TABLE "public"."resource_categories" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "name" text NOT NULL,
    "description" text,
    "icon" text,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."resources" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "title" text NOT NULL,
    "description" text,
    "type" resource_type NOT NULL,
    "url" text,
    "storage_path" text,
    "event_name" text,
    "category_id" uuid,
    "downloads" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now(),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("category_id") REFERENCES "public"."resource_categories"("id") ON DELETE SET NULL
);

CREATE TABLE "public"."notifications" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "recipient_id" uuid NOT NULL,
    "title" text NOT NULL,
    "message" text NOT NULL,
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("recipient_id") REFERENCES "public"."students"("id") ON DELETE CASCADE
);

CREATE TABLE "public"."reports" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "reporter_id" uuid REFERENCES "public"."students"("id") ON DELETE SET NULL,
    "target_type" report_target_type NOT NULL,
    "target_id" uuid NOT NULL,
    "reason" text,
    "created_at" timestamptz DEFAULT now()
);

-- DM request flow: 1:1 chats require recipient to accept before chat is created
CREATE TABLE "public"."chat_requests" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "requester_id" uuid NOT NULL REFERENCES "public"."students"("id") ON DELETE CASCADE,
    "recipient_id" uuid NOT NULL REFERENCES "public"."students"("id") ON DELETE CASCADE,
    "status" text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "chat_requests_no_self" CHECK (requester_id <> recipient_id)
);

CREATE UNIQUE INDEX "idx_chat_requests_pending_pair" ON "public"."chat_requests" (requester_id, recipient_id)
  WHERE status = 'pending';

-- Social / OAuth (from SOCIAL_CONNECTIONS_SCHEMA)
CREATE TABLE "public"."oauth_states" (
    "state" text PRIMARY KEY,
    "user_id" uuid NOT NULL REFERENCES "public"."students"("id") ON DELETE CASCADE,
    "platform" text NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
    "expires_at" timestamptz NOT NULL,
    "created_at" timestamptz DEFAULT now()
);

CREATE TABLE "public"."social_connections" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "student_id" uuid NOT NULL REFERENCES "public"."students"("id") ON DELETE CASCADE,
    "platform" text NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
    "platform_user_id" text NOT NULL,
    "username" text,
    "display_name" text,
    "profile_picture" text,
    "access_token" text NOT NULL,
    "refresh_token" text,
    "token_expires_at" timestamptz,
    "scopes" text[],
    "last_synced_at" timestamptz,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    UNIQUE ("student_id", "platform")
);

CREATE TABLE "public"."social_imports" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "connection_id" uuid NOT NULL REFERENCES "public"."social_connections"("id") ON DELETE CASCADE,
    "platform_post_id" text NOT NULL,
    "post_id" uuid REFERENCES "public"."posts"("id") ON DELETE SET NULL,
    "media_url" text,
    "caption" text,
    "permalink" text,
    "media_type" text,
    "imported_at" timestamptz DEFAULT now(),
    UNIQUE ("connection_id", "platform_post_id")
);

CREATE TABLE "public"."user_preferences" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "student_id" uuid NOT NULL UNIQUE REFERENCES "public"."students"("id") ON DELETE CASCADE,
    "theme" text DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'high-contrast')),
    "font_size" text DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large', 'extra-large')),
    "high_contrast" boolean DEFAULT false,
    "reduced_motion" boolean DEFAULT false,
    "screen_reader_optimized" boolean DEFAULT false,
    "keyboard_navigation_enhanced" boolean DEFAULT false,
    "color_blind_mode" text DEFAULT 'none' CHECK (color_blind_mode IN ('none', 'protanopia', 'deuteranopia', 'tritanopia')),
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL
);

-- 4. Functions and triggers

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.students (id, name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_school_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.schools SET member_count = member_count + 1 WHERE id = NEW.school_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.schools SET member_count = member_count - 1 WHERE id = OLD.school_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.students SET following_count = following_count + 1 WHERE id = NEW.follower_id;
        UPDATE public.students SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.students SET following_count = following_count - 1 WHERE id = OLD.follower_id;
        UPDATE public.students SET follower_count = follower_count - 1 WHERE id = OLD.following_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_social_connection_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Avoid RLS recursion: returns chat IDs for current user without querying chat_participants via RLS.
CREATE OR REPLACE FUNCTION public.get_my_chat_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT chat_id FROM public.chat_participants WHERE student_id = auth.uid();
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TRIGGER post_like_count_trigger
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_like_count();

CREATE TRIGGER post_comment_count_trigger
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comment_count();

CREATE TRIGGER school_member_count_trigger
  AFTER INSERT OR DELETE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_school_member_count();

CREATE TRIGGER student_follow_count_trigger
  AFTER INSERT OR DELETE ON public.student_follows
  FOR EACH ROW EXECUTE FUNCTION public.update_follow_counts();

CREATE TRIGGER social_connection_updated_at_trigger
  BEFORE UPDATE ON public.social_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_social_connection_updated_at();

CREATE TRIGGER chat_request_updated_at_trigger
  BEFORE UPDATE ON public.chat_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_social_connection_updated_at();

CREATE TRIGGER user_preferences_updated_at_trigger
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_social_connection_updated_at();

-- 5. RLS

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 6. Policies

CREATE POLICY "Allow public read access on schools" ON public.schools FOR SELECT USING (true);
CREATE POLICY "Allow public read access on resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Allow public read access on resource_categories" ON public.resource_categories FOR SELECT USING (true);
CREATE POLICY "Students can view public profiles" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read access on events" ON public.events FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile" ON public.students FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view school roles" ON public.school_roles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own school roles" ON public.school_roles FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can update their own school roles" ON public.school_roles FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Users can delete their own school roles" ON public.school_roles FOR DELETE USING (auth.uid() = student_id);
CREATE POLICY "Authenticated users can view event registrations" ON public.event_registrations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert their own event registrations" ON public.event_registrations FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can delete their own event registrations" ON public.event_registrations FOR DELETE USING (auth.uid() = student_id);
CREATE POLICY "Authenticated users can view follow relationships" ON public.student_follows FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage their own follows" ON public.student_follows FOR ALL USING (auth.uid() = follower_id);
CREATE POLICY "Users can read their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "Users can manage their own reports" ON public.reports FOR ALL USING (auth.uid() = reporter_id);

CREATE POLICY "Students can read posts from same school" ON public.posts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.students viewer
    JOIN public.students author ON author.id = posts.author_id
    WHERE viewer.id = auth.uid()
      AND (viewer.school_id = author.school_id OR viewer.school_id IS NULL OR author.school_id IS NULL)
  )
);

CREATE POLICY "Users can view media on accessible posts" ON public.media FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.posts p
    JOIN public.students post_author ON p.author_id = post_author.id
    JOIN public.students viewer ON viewer.id = auth.uid()
    WHERE p.id = media.post_id
      AND (post_author.school_id = viewer.school_id OR post_author.school_id IS NULL OR viewer.school_id IS NULL)
  )
);

CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Users can view comments on accessible posts" ON public.comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.posts p
    JOIN public.students post_author ON p.author_id = post_author.id
    JOIN public.students viewer ON viewer.id = auth.uid()
    WHERE p.id = comments.post_id
      AND (post_author.school_id = viewer.school_id OR post_author.school_id IS NULL OR viewer.school_id IS NULL)
  )
);
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own comments" ON public.comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Users can view likes on accessible posts" ON public.likes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.posts p
    JOIN public.students post_author ON p.author_id = post_author.id
    JOIN public.students viewer ON viewer.id = auth.uid()
    WHERE p.id = likes.post_id
      AND (post_author.school_id = viewer.school_id OR post_author.school_id IS NULL OR viewer.school_id IS NULL)
  )
);
CREATE POLICY "Authenticated users can like posts" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Chat policies (consolidated: base + CHAT_DM_POLICIES)
CREATE POLICY "Chat members can view chat and participants" ON public.chats FOR SELECT USING (
  id IN (SELECT chat_id FROM public.chat_participants WHERE student_id = auth.uid())
  OR created_by = auth.uid()
);

CREATE POLICY "Users can create chats" ON public.chats FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Participants can delete chats" ON public.chats FOR DELETE USING (
  id IN (SELECT chat_id FROM public.chat_participants WHERE student_id = auth.uid())
);

CREATE POLICY "Participants can update group chat details" ON public.chats FOR UPDATE USING (
  id IN (SELECT chat_id FROM public.chat_participants WHERE student_id = auth.uid())
);

-- Chat requests: requester creates; recipient accepts/declines
CREATE POLICY "Users can view own chat requests" ON public.chat_requests FOR SELECT USING (
  requester_id = auth.uid() OR recipient_id = auth.uid()
);
CREATE POLICY "Users can create chat requests" ON public.chat_requests FOR INSERT WITH CHECK (
  requester_id = auth.uid() AND recipient_id <> auth.uid()
);
CREATE POLICY "Recipients can update chat requests" ON public.chat_requests FOR UPDATE USING (
  recipient_id = auth.uid()
);

CREATE POLICY "Users can view chat participants" ON public.chat_participants FOR SELECT USING (
  chat_id IN (SELECT public.get_my_chat_ids())
);

CREATE POLICY "Users can add chat participants" ON public.chat_participants FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.chats c WHERE c.id = chat_id AND c.created_by = auth.uid())
  OR EXISTS (SELECT 1 FROM public.chat_participants cp WHERE cp.chat_id = chat_participants.chat_id AND cp.student_id = auth.uid())
);

CREATE POLICY "Users can update chat participants" ON public.chat_participants FOR UPDATE USING (student_id = auth.uid());

CREATE POLICY "Users can remove chat participants" ON public.chat_participants FOR DELETE USING (
  student_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.chats c WHERE c.id = chat_participants.chat_id AND c.created_by = auth.uid())
);

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

-- Social connections policies
CREATE POLICY "Users can view their own social connections" ON public.social_connections FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can create their own social connections" ON public.social_connections FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can update their own social connections" ON public.social_connections FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Users can delete their own social connections" ON public.social_connections FOR DELETE USING (auth.uid() = student_id);

CREATE POLICY "Users can view their social imports" ON public.social_imports FOR SELECT USING (
  connection_id IN (SELECT id FROM public.social_connections WHERE student_id = auth.uid())
);
CREATE POLICY "Users can create their social imports" ON public.social_imports FOR INSERT WITH CHECK (
  connection_id IN (SELECT id FROM public.social_connections WHERE student_id = auth.uid())
);
CREATE POLICY "Users can delete their social imports" ON public.social_imports FOR DELETE USING (
    connection_id IN (SELECT id FROM public.social_connections WHERE student_id = auth.uid())
);

CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can insert their own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can update their own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = student_id);

-- 7. Indexes

CREATE INDEX idx_students_school ON public.students(school_id);
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_comments_post ON public.comments(post_id);
CREATE INDEX idx_comments_author ON public.comments(author_id);
CREATE INDEX idx_likes_post ON public.likes(post_id);
CREATE INDEX idx_messages_chat ON public.messages(chat_id);
CREATE INDEX idx_chat_requests_recipient_status ON public.chat_requests(recipient_id, status);
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX idx_resources_event_name ON public.resources(event_name);
CREATE INDEX idx_students_awards ON public.students USING GIN (awards);
CREATE INDEX idx_students_interests ON public.students USING GIN (interests);

CREATE INDEX idx_oauth_states_expires ON public.oauth_states(expires_at);
CREATE INDEX idx_social_connections_student ON public.social_connections(student_id);
CREATE INDEX idx_social_connections_platform ON public.social_connections(platform);
CREATE INDEX idx_social_imports_connection ON public.social_imports(connection_id);
CREATE INDEX idx_social_imports_post ON public.social_imports(post_id);
CREATE INDEX idx_user_preferences_student_id ON public.user_preferences(student_id);
