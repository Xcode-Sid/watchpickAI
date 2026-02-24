-- Add is_deleted (soft delete) to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_is_deleted ON public.profiles (is_deleted);
