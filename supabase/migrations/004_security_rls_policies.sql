-- ============================================================
-- Security hardening: RLS + least-privilege policies
-- ============================================================

-- 1) Enable RLS for all application tables in public schema.
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_rankings ENABLE ROW LEVEL SECURITY;

-- 2) Recreate select-only policies for public app reads.
DROP POLICY IF EXISTS works_public_read ON works;
CREATE POLICY works_public_read
  ON works
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS videos_public_read ON videos;
CREATE POLICY videos_public_read
  ON videos
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS platforms_public_read ON platforms;
CREATE POLICY platforms_public_read
  ON platforms
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS work_platforms_public_read ON work_platforms;
CREATE POLICY work_platforms_public_read
  ON work_platforms
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS weekly_rankings_public_read ON weekly_rankings;
CREATE POLICY weekly_rankings_public_read
  ON weekly_rankings
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS monthly_rankings_public_read ON monthly_rankings;
CREATE POLICY monthly_rankings_public_read
  ON monthly_rankings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- No policies for pending_videos on purpose:
-- - anon/authenticated: no access
-- - service_role: bypasses RLS

-- 3) Make views honor caller privileges.
ALTER VIEW works_with_video_stats SET (security_invoker = true);
ALTER VIEW upcoming_works SET (security_invoker = true);
