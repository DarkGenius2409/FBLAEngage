-- Update Resources Schema to Support FBLA Events
-- Run this in Supabase SQL Editor to add event_name field to resources

-- Add event_name column to resources table
ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS event_name text;

-- Add description column if it doesn't exist
ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS description text;

-- Add timestamps if they don't exist
ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create index for faster event_name lookups
CREATE INDEX IF NOT EXISTS idx_resources_event_name ON public.resources(event_name);

-- Add comment for documentation
COMMENT ON COLUMN public.resources.event_name IS 'Links to FBLA competitive event name (e.g., "Accounting", "Business Plan")';
