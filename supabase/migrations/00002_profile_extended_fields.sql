-- EsKultura: Extended profile fields + avatar storage
-- Run this migration in the Supabase SQL Editor

-- ─── Add new profile columns ─────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS course TEXT,
  ADD COLUMN IF NOT EXISTS student_number TEXT,
  ADD COLUMN IF NOT EXISTS unit_info TEXT,
  ADD COLUMN IF NOT EXISTS experience_awards TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ─── Storage: avatars bucket ─────────────────────────────────────────────────
-- Create the bucket (idempotent via DO block)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own avatar
CREATE POLICY IF NOT EXISTS "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update their own avatar
CREATE POLICY IF NOT EXISTS "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read of all avatars (bucket is public)
CREATE POLICY IF NOT EXISTS "Public read avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');
