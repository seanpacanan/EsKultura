-- EsKultura: Proper relational tables replacing the KV store
-- Run this migration in the Supabase SQL Editor

-- ─── Profiles ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  unit TEXT CHECK (unit IN ('Himig', 'Teatro', 'Katha', 'Ritmo', 'Likha')),
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'coordinator', 'viewer')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for filtering by unit and role
CREATE INDEX IF NOT EXISTS idx_profiles_unit ON public.profiles(unit);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- ─── Membership Requests ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.membership_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  user_email TEXT,
  unit TEXT NOT NULL CHECK (unit IN ('Himig', 'Teatro', 'Katha', 'Ritmo', 'Likha')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, unit) -- one active request per user per unit
);

CREATE INDEX IF NOT EXISTS idx_membership_requests_unit ON public.membership_requests(unit);
CREATE INDEX IF NOT EXISTS idx_membership_requests_status ON public.membership_requests(status);
CREATE INDEX IF NOT EXISTS idx_membership_requests_user_id ON public.membership_requests(user_id);

-- ─── Announcements ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  unit TEXT CHECK (unit IN ('Himig', 'Teatro', 'Katha', 'Ritmo', 'Likha')),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_by_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_announcements_unit ON public.announcements(unit);
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON public.announcements(created_by);

-- ─── RLS Policies ───────────────────────────────────────────────────────────
-- The edge function uses the service role key, so RLS is bypassed.
-- These policies are for direct client access if needed in the future.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Profiles: users can update their own profile (name, unit only)
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Membership requests: users can read their own requests
CREATE POLICY "Users can read own membership requests" ON public.membership_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Announcements: authenticated users can read visible announcements
CREATE POLICY "Authenticated users can read announcements" ON public.announcements
  FOR SELECT USING (true);


-- ─── Migrate existing KV data ───────────────────────────────────────────────
-- Only runs if the old kv_store_b49a1e6e table exists. Safe to re-run.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kv_store_b49a1e6e') THEN
    INSERT INTO public.profiles (id, email, full_name, unit, role, status, created_at)
    SELECT
      (value->>'id')::UUID,
      value->>'email',
      value->>'full_name',
      value->>'unit',
      COALESCE(value->>'role', 'viewer'),
      COALESCE(value->>'status', 'inactive'),
      COALESCE((value->>'created_at')::TIMESTAMPTZ, now())
    FROM kv_store_b49a1e6e
    WHERE key LIKE 'eskultura:profile:%'
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      unit = EXCLUDED.unit,
      role = EXCLUDED.role,
      status = EXCLUDED.status;

    INSERT INTO public.membership_requests (id, user_id, user_name, user_email, unit, status, created_at)
    SELECT
      (value->>'id')::UUID,
      (value->>'user_id')::UUID,
      value->>'user_name',
      value->>'user_email',
      value->>'unit',
      COALESCE(value->>'status', 'pending'),
      COALESCE((value->>'created_at')::TIMESTAMPTZ, now())
    FROM kv_store_b49a1e6e
    WHERE key LIKE 'eskultura:membership:%'
    ON CONFLICT (id) DO UPDATE SET
      user_name = EXCLUDED.user_name,
      user_email = EXCLUDED.user_email,
      unit = EXCLUDED.unit,
      status = EXCLUDED.status;

    INSERT INTO public.announcements (id, title, content, unit, created_by, created_by_name, created_at, updated_at)
    SELECT
      (value->>'id')::UUID,
      value->>'title',
      value->>'content',
      value->>'unit',
      (value->>'created_by')::UUID,
      value->>'created_by_name',
      COALESCE((value->>'created_at')::TIMESTAMPTZ, now()),
      (value->>'updated_at')::TIMESTAMPTZ
    FROM kv_store_b49a1e6e
    WHERE key LIKE 'eskultura:announcement:%'
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      content = EXCLUDED.content,
      unit = EXCLUDED.unit,
      created_by_name = EXCLUDED.created_by_name,
      updated_at = EXCLUDED.updated_at;

    RAISE NOTICE 'KV data migration completed.';
  ELSE
    RAISE NOTICE 'kv_store_b49a1e6e table not found — skipping data migration (fresh install).';
  END IF;
END
$$;
