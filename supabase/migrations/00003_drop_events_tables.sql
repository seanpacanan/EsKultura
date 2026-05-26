-- Remove legacy Events feature tables (no longer used by the app).
-- Safe on fresh installs where these tables were never created.

DROP TABLE IF EXISTS public.event_rsvps CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
