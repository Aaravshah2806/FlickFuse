-- ============================================================
-- Migration: 001_initial_schema
-- Description: Initial database schema for StreamSync
-- Created: 2026-03-20
-- ============================================================

-- Run the main schema
\i ../schema.sql

-- ============================================================
-- NOTES FOR DEPLOYMENT
-- ============================================================

-- 1. Run this migration in Supabase Dashboard:
--    SQL Editor > Copy entire file content > Run

-- 2. Or use Supabase CLI:
--    supabase db push
--    supabase migration new 001_initial_schema

-- 3. Verify RLS is enabled on all tables:
--    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
--    AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = pg_tables.tablename);

-- 4. Check indexes are created:
--    SELECT indexname FROM pg_indexes WHERE schemaname = 'public';

-- ============================================================
-- POST-MIGRATION CHECKLIST
-- ============================================================

-- [ ] Verify all tables exist
-- [ ] Verify RLS policies are created
-- [ ] Verify triggers are active
-- [ ] Test user signup flow (profile auto-creation)
-- [ ] Test friend request acceptance (friendship auto-creation)
-- [ ] Verify calculate_taste_compatibility function works
-- [ ] Check index performance with EXPLAIN ANALYZE
