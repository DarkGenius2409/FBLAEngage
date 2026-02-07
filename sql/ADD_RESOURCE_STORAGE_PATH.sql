-- Add storage_path for resources stored in Supabase Storage
-- When set, the Resources page uses supabase.storage.from('resources').getPublicUrl(storage_path)
-- Run in Supabase SQL Editor

ALTER TABLE public.resources
ADD COLUMN IF NOT EXISTS storage_path text;

COMMENT ON COLUMN public.resources.storage_path IS 'Path within the resources storage bucket (e.g., Accounting/guidelines.pdf). Used to construct public URL.';
