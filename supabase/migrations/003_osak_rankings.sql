-- ============================================================
-- OSAK (오싹) — 주간/월간 랭킹 시스템
-- works는 기존 유지, platforms / work_platforms / weekly_rankings / monthly_rankings 추가
-- ============================================================

-- ① platforms (플랫폼 마스터)
CREATE TABLE IF NOT EXISTS platforms (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);

-- ② work_platforms (작품–플랫폼 N:M, cascade delete)
CREATE TABLE IF NOT EXISTS work_platforms (
  work_id     uuid NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  platform_id uuid NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  PRIMARY KEY (work_id, platform_id)
);
CREATE INDEX IF NOT EXISTS idx_work_platforms_work_id ON work_platforms(work_id);
CREATE INDEX IF NOT EXISTS idx_work_platforms_platform_id ON work_platforms(platform_id);

-- ③ weekly_rankings (주간 스냅샷)
CREATE TABLE IF NOT EXISTS weekly_rankings (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id    uuid        NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  rank       integer     NOT NULL,
  score      numeric(10,4) NOT NULL,
  week       integer     NOT NULL CHECK (week >= 1 AND week <= 53),
  year       integer     NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (year, week, work_id)
);
CREATE INDEX IF NOT EXISTS idx_weekly_rankings_year_week ON weekly_rankings(year, week);
CREATE INDEX IF NOT EXISTS idx_weekly_rankings_work_id ON weekly_rankings(work_id);

-- ④ monthly_rankings (월간 집계: 해당 월 주간 score 평균)
CREATE TABLE IF NOT EXISTS monthly_rankings (
  id      uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id uuid          NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  rank    integer       NOT NULL,
  score   numeric(10,4) NOT NULL,
  month   integer       NOT NULL CHECK (month >= 1 AND month <= 12),
  year    integer       NOT NULL,
  UNIQUE (year, month, work_id)
);
CREATE INDEX IF NOT EXISTS idx_monthly_rankings_year_month ON monthly_rankings(year, month);
CREATE INDEX IF NOT EXISTS idx_monthly_rankings_work_id ON monthly_rankings(work_id);

-- 플랫폼 시드 (한국 OTT)
INSERT INTO platforms (name) VALUES
  ('Netflix'),
  ('TVING'),
  ('Disney+'),
  ('Coupang Play')
ON CONFLICT (name) DO NOTHING;
