-- FBLA Engage Supabase Schema
-- Version 2.0 (Incorporates community feedback)

-- 1. Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create ENUM types (only if they don't exist)
-- Note: PostgreSQL doesn't support CREATE TYPE IF NOT EXISTS, so we use DO blocks
DO $$ BEGIN
  CREATE TYPE "public"."media_type" AS ENUM ('image', 'video', 'document');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."resource_type" AS ENUM ('pdf', 'link', 'video');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."event_level" AS ENUM ('regional', 'state', 'national');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."chat_type" AS ENUM ('direct', 'group', 'school');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."report_target_type" AS ENUM ('post', 'comment', 'student');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Create tables

-- Schools Table (FBLA Chapters)
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
    "member_count" integer DEFAULT 0, -- Maintained by trigger
    "established_at" timestamp with time zone,
    PRIMARY KEY ("id")
);

-- Students Table (Users)
CREATE TABLE "public"."students" (
    "id" uuid NOT NULL, -- Matches auth.users.id
    "name" text NOT NULL,
    "email" text NOT NULL UNIQUE,
    "school_id" uuid,
    "bio" text,
    "image" text,
    "banner" text,
    "awards" jsonb DEFAULT '[]'::jsonb,
    "interests" jsonb DEFAULT '[]'::jsonb,
    "follower_count" integer DEFAULT 0, -- Maintained by trigger
    "following_count" integer DEFAULT 0, -- Maintained by trigger
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE SET NULL
);

-- School Roles Table
CREATE TABLE "public"."school_roles" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "student_id" uuid NOT NULL REFERENCES "public"."students"("id") ON DELETE CASCADE,
    "school_id" uuid NOT NULL REFERENCES "public"."schools"("id") ON DELETE CASCADE,
    "role" text NOT NULL, -- e.g., 'President', 'Member', 'Advisor'
    UNIQUE ("student_id", "school_id")
);

-- Events and Registrations
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

-- Posts, Media, Comments, Likes
CREATE TABLE "public"."posts" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "content" text NOT NULL,
    "author_id" uuid NOT NULL,
    "like_count" integer DEFAULT 0, -- Maintained by trigger
    "comment_count" integer DEFAULT 0, -- Maintained by trigger
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

-- Student Follows (Social Graph)
CREATE TABLE "public"."student_follows" (
    "follower_id" uuid NOT NULL,
    "following_id" uuid NOT NULL,
    PRIMARY KEY ("follower_id", "following_id"),
    FOREIGN KEY ("follower_id") REFERENCES "public"."students"("id") ON DELETE CASCADE,
    FOREIGN KEY ("following_id") REFERENCES "public"."students"("id") ON DELETE CASCADE,
    CONSTRAINT "no_self_follow" CHECK (follower_id <> following_id)
);

-- Chat System
CREATE TABLE "public"."chats" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "type" chat_type DEFAULT 'direct',
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

-- Resources
-- Resource Categories (kept for backward compatibility, but now primarily use event_name)
CREATE TABLE "public"."resource_categories" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "name" text NOT NULL,
    "description" text,
    "icon" text,
    PRIMARY KEY ("id")
);

-- Resources Table
-- Resources are linked to FBLA competitive events via the event_name field
-- The event_name should match official FBLA event names (e.g., "Accounting", "Business Plan", "Marketing")
-- category_id is kept for backward compatibility but event_name is the primary way to organize resources
CREATE TABLE "public"."resources" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "title" text NOT NULL,
    "description" text, -- Detailed description of the resource
    "type" resource_type NOT NULL, -- 'pdf', 'link', or 'video'
    "url" text, -- URL to the resource (download link, external link, or video URL)
    "event_name" text, -- Links to FBLA competitive event name (e.g., "Accounting", "Business Plan")
    "category_id" uuid, -- Kept for backward compatibility with resource_categories
    "downloads" integer DEFAULT 0, -- Track number of times resource has been downloaded/accessed
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now(),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("category_id") REFERENCES "public"."resource_categories"("id") ON DELETE SET NULL
);

-- Notifications
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

-- Moderation
CREATE TABLE "public"."reports" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "reporter_id" uuid REFERENCES "public"."students"("id") ON DELETE SET NULL,
    "target_type" report_target_type NOT NULL,
    "target_id" uuid NOT NULL,
    "reason" text,
    "created_at" timestamptz DEFAULT now()
);

-- 4. Create database functions and triggers

-- Trigger to create a student profile when a new user signs up
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

-- Trigger to update post like count
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

-- Trigger to update post comment count
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

-- Trigger to update school member count
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

-- Trigger to update follower/following counts
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

-- 5. Apply triggers to tables
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

-- 6. Set up Row Level Security (RLS)
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
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS Policies
-- Public read access
CREATE POLICY "Allow public read access on schools" ON public.schools FOR SELECT USING (true);
CREATE POLICY "Allow public read access on resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Allow public read access on resource_categories" ON public.resource_categories FOR SELECT USING (true);
CREATE POLICY "Students can view public profiles" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read access on events" ON public.events FOR SELECT USING (auth.role() = 'authenticated');


-- Users can manage their own data
CREATE POLICY "Users can update their own profile" ON public.students FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view school roles" ON public.school_roles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own school roles" ON public.school_roles FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can update their own school roles" ON public.school_roles FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Users can delete their own school roles" ON public.school_roles FOR DELETE USING (auth.uid() = student_id);
CREATE POLICY "Authenticated users can view event registrations" ON public.event_registrations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert their own event registrations" ON public.event_registrations FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can delete their own event registrations" ON public.event_registrations FOR DELETE USING (auth.uid() = student_id);
CREATE POLICY "Users can manage their own follows" ON public.student_follows FOR ALL USING (auth.uid() = follower_id);
CREATE POLICY "Users can read their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "Users can manage their own reports" ON public.reports FOR ALL USING (auth.uid() = reporter_id);

-- School-based read access for posts
CREATE POLICY "Students can read posts from same school" ON public.posts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.students s1
    JOIN public.students s2 ON s1.school_id = s2.school_id
    WHERE s1.id = auth.uid()
      AND s2.id = posts.author_id
  )
);

-- Users can view media on posts they can see (same school)
CREATE POLICY "Users can view media on accessible posts" ON public.media FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.posts p
    JOIN public.students post_author ON p.author_id = post_author.id
    JOIN public.students viewer ON viewer.id = auth.uid()
    WHERE p.id = media.post_id
      AND (post_author.school_id = viewer.school_id OR post_author.school_id IS NULL OR viewer.school_id IS NULL)
  )
);

-- Authenticated users can manage posts, comments, likes
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = author_id);

-- Users can view comments on posts they can see (same school)
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

-- Users can view likes on posts they can see (same school)
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

-- Chat policies
-- Users can view chats they're participants in (check via chat_participants, but avoid recursion by checking student_id directly)
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

-- 8. Add Performance Indexes
CREATE INDEX idx_students_school ON public.students(school_id);
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_comments_post ON public.comments(post_id);
CREATE INDEX idx_comments_author ON public.comments(author_id);
CREATE INDEX idx_likes_post ON public.likes(post_id);
CREATE INDEX idx_messages_chat ON public.messages(chat_id);
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX idx_resources_event_name ON public.resources(event_name);
-- GIN indexes for jsonb columns
CREATE INDEX idx_students_awards ON public.students USING GIN (awards);
CREATE INDEX idx_students_interests ON public.students USING GIN (interests);