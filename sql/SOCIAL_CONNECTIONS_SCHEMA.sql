-- Social Media Connections Schema
-- Adds tables for OAuth-based social media integration (Instagram, TikTok)

-- OAuth state table for CSRF protection
CREATE TABLE IF NOT EXISTS "public"."oauth_states" (
    "state" text PRIMARY KEY,
    "user_id" uuid NOT NULL REFERENCES "public"."students"("id") ON DELETE CASCADE,
    "platform" text NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
    "expires_at" timestamptz NOT NULL,
    "created_at" timestamptz DEFAULT now()
);

-- Cleanup expired states (run periodically)
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON public.oauth_states(expires_at);

-- Social media connections table
-- Stores OAuth tokens and user profile info from connected platforms
CREATE TABLE IF NOT EXISTS "public"."social_connections" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "student_id" uuid NOT NULL REFERENCES "public"."students"("id") ON DELETE CASCADE,
    "platform" text NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
    "platform_user_id" text NOT NULL,
    "username" text,
    "display_name" text,
    "profile_picture" text,
    "access_token" text NOT NULL, -- encrypted via pgcrypto
    "refresh_token" text, -- encrypted via pgcrypto
    "token_expires_at" timestamptz,
    "scopes" text[],
    "last_synced_at" timestamptz,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    UNIQUE ("student_id", "platform")
);

-- Imported social media posts
-- Tracks which posts have been imported to avoid duplicates
CREATE TABLE IF NOT EXISTS "public"."social_imports" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "connection_id" uuid NOT NULL REFERENCES "public"."social_connections"("id") ON DELETE CASCADE,
    "platform_post_id" text NOT NULL,
    "post_id" uuid REFERENCES "public"."posts"("id") ON DELETE SET NULL,
    "media_url" text,
    "caption" text,
    "permalink" text,
    "media_type" text, -- 'image', 'video', 'carousel'
    "imported_at" timestamptz DEFAULT now(),
    UNIQUE ("connection_id", "platform_post_id")
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_connections_student ON public.social_connections(student_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_platform ON public.social_connections(platform);
CREATE INDEX IF NOT EXISTS idx_social_imports_connection ON public.social_imports(connection_id);
CREATE INDEX IF NOT EXISTS idx_social_imports_post ON public.social_imports(post_id);

-- Enable Row Level Security
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_imports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_connections
-- Users can only view their own connections
CREATE POLICY "Users can view their own social connections" 
    ON public.social_connections 
    FOR SELECT 
    USING (auth.uid() = student_id);

-- Users can insert their own connections
CREATE POLICY "Users can create their own social connections" 
    ON public.social_connections 
    FOR INSERT 
    WITH CHECK (auth.uid() = student_id);

-- Users can update their own connections
CREATE POLICY "Users can update their own social connections" 
    ON public.social_connections 
    FOR UPDATE 
    USING (auth.uid() = student_id);

-- Users can delete their own connections
CREATE POLICY "Users can delete their own social connections" 
    ON public.social_connections 
    FOR DELETE 
    USING (auth.uid() = student_id);

-- RLS Policies for social_imports
-- Users can view imports for their connections
CREATE POLICY "Users can view their social imports" 
    ON public.social_imports 
    FOR SELECT 
    USING (
        connection_id IN (
            SELECT id FROM public.social_connections WHERE student_id = auth.uid()
        )
    );

-- Users can create imports for their connections
CREATE POLICY "Users can create their social imports" 
    ON public.social_imports 
    FOR INSERT 
    WITH CHECK (
        connection_id IN (
            SELECT id FROM public.social_connections WHERE student_id = auth.uid()
        )
    );

-- Users can delete their imports
CREATE POLICY "Users can delete their social imports" 
    ON public.social_imports 
    FOR DELETE 
    USING (
        connection_id IN (
            SELECT id FROM public.social_connections WHERE student_id = auth.uid()
        )
    );

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_social_connection_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS social_connection_updated_at_trigger ON public.social_connections;
CREATE TRIGGER social_connection_updated_at_trigger
    BEFORE UPDATE ON public.social_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_social_connection_updated_at();
