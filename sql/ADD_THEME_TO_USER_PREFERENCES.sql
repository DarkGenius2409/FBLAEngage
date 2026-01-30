-- Add theme column to user_preferences (light, dark, high-contrast)
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS theme text DEFAULT 'light'
  CHECK (theme IN ('light', 'dark', 'high-contrast'));

-- Backfill: users who had high contrast on get theme 'high-contrast'
UPDATE public.user_preferences
SET theme = 'high-contrast'
WHERE high_contrast = true;
