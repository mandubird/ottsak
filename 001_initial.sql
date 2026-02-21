-- ============================================================
-- 옽싹 (OTSAK) 플랫폼 - 초기 DB 마이그레이션
-- Supabase SQL Editor에 전체 복사 후 Run 버튼 클릭
-- ============================================================

-- ① works 테이블 (작품 정보)
CREATE TABLE IF NOT EXISTS works (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text        UNIQUE NOT NULL,              -- URL용 고유 ID (예: avengers-endgame)
  title        text        NOT NULL,                     -- 작품명 (한글)
  title_en     text,                                     -- 영문명 (YouTube 검색용)
  type         text        NOT NULL CHECK (type IN ('movie', 'series')),
  genre        text[],                                   -- 장르 배열
  platform     text[],                                   -- 플랫폼 배열 (Netflix, 웨이브 등)
  release_date date,                                     -- 공개일
  rating       numeric(3,1),                             -- 평점 (0.0 ~ 10.0)
  poster_url   text,                                     -- 포스터 이미지
  backdrop_url text,                                     -- 배경 이미지
  overview     text,                                     -- 줄거리
  tmdb_id      integer     UNIQUE,                       -- TMDB 작품 ID (중복 방지)
  view_count   integer     DEFAULT 0,                    -- 페이지 조회수
  is_featured  boolean     DEFAULT false,                -- 홈 화제 작품 여부
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- ② videos 테이블 (YouTube 영상)
CREATE TABLE IF NOT EXISTS videos (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id       uuid        NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  youtube_id    text        UNIQUE NOT NULL,             -- YouTube 영상 ID (중복 방지)
  title         text        NOT NULL,
  video_type    text        DEFAULT 'etc'
                  CHECK (video_type IN ('trailer', 'shorts', 'review', 'etc')),
  thumbnail_url text,
  channel_name  text,
  view_count    bigint      DEFAULT 0,                   -- YouTube 조회수
  duration_sec  integer,                                 -- 영상 길이(초)
  match_score   numeric(3,2),                            -- 매칭 정확도 (0.00~1.00)
  published_at  timestamptz,
  created_at    timestamptz DEFAULT now()
);

-- ③ pending_videos 테이블 (매칭 실패 보류)
CREATE TABLE IF NOT EXISTS pending_videos (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id         text        NOT NULL,
  title              text,
  guessed_work_title text,                               -- 자동 추측한 작품명
  match_score        numeric(3,2),                       -- 매칭 점수 (70% 미만)
  raw_data           jsonb,                              -- YouTube API 원본 응답
  reviewed           boolean     DEFAULT false,          -- 관리자 검토 여부
  created_at         timestamptz DEFAULT now()
);

-- ============================================================
-- 인덱스 설계 (검색 성능 최적화)
-- ============================================================

-- works 인덱스
CREATE INDEX IF NOT EXISTS idx_works_slug         ON works(slug);
CREATE INDEX IF NOT EXISTS idx_works_genre        ON works USING gin(genre);        -- 배열 검색
CREATE INDEX IF NOT EXISTS idx_works_platform     ON works USING gin(platform);
CREATE INDEX IF NOT EXISTS idx_works_release_desc ON works(release_date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_works_view_count   ON works(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_works_tmdb_id      ON works(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_works_featured     ON works(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_works_type         ON works(type);

-- videos 인덱스
CREATE INDEX IF NOT EXISTS idx_videos_work_id     ON videos(work_id);
CREATE INDEX IF NOT EXISTS idx_videos_type        ON videos(video_type);
CREATE INDEX IF NOT EXISTS idx_videos_view_desc   ON videos(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_videos_youtube_id  ON videos(youtube_id);
CREATE INDEX IF NOT EXISTS idx_videos_work_type   ON videos(work_id, video_type); -- 복합 인덱스

-- pending_videos 인덱스
CREATE INDEX IF NOT EXISTS idx_pending_reviewed   ON pending_videos(reviewed) WHERE reviewed = false;

-- ============================================================
-- updated_at 자동 갱신 트리거
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_works_updated_at ON works;
CREATE TRIGGER trigger_works_updated_at
  BEFORE UPDATE ON works
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 샘플 데이터 (테스트용)
-- ============================================================

INSERT INTO works (slug, title, title_en, type, genre, platform, release_date, rating, overview, is_featured)
VALUES
  ('moving-season1', '무빙', 'Moving', 'series',
   ARRAY['액션', '드라마', 'SF'], ARRAY['Disney+'],
   '2023-08-09', 8.5,
   '초능력을 숨기고 살아가는 부모와 그 아이들이 전쟁 같은 현재를 살아가는 이야기.',
   true),

  ('dr-slump', '닥터슬럼프', 'Dr. Slump', 'series',
   ARRAY['로맨스', '드라마', '코미디'], ARRAY['Netflix'],
   '2024-01-27', 7.9,
   '1등만 해온 두 사람이 인생의 슬럼프에서 만나 서로를 통해 회복하는 로맨스.',
   true),

  ('wonderland', '원더랜드', 'Wonderland', 'movie',
   ARRAY['SF', '드라마'], ARRAY['Netflix'],
   '2024-06-05', 6.8,
   'AI 기술로 세상을 떠난 사람과 교감할 수 있는 서비스를 배경으로 한 이야기.',
   false)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 유용한 View (자주 쓰는 쿼리 미리 정의)
-- ============================================================

-- 작품별 영상 집계 뷰
CREATE OR REPLACE VIEW works_with_video_stats AS
SELECT
  w.*,
  COUNT(v.id)                                    AS video_count,
  COUNT(v.id) FILTER (WHERE v.video_type = 'trailer') AS trailer_count,
  COUNT(v.id) FILTER (WHERE v.video_type = 'shorts')  AS shorts_count,
  COUNT(v.id) FILTER (WHERE v.video_type = 'review')  AS review_count,
  MAX(v.view_count)                              AS max_video_views
FROM works w
LEFT JOIN videos v ON v.work_id = w.id
GROUP BY w.id;

-- 공개 예정 작품 뷰 (달력 페이지용)
CREATE OR REPLACE VIEW upcoming_works AS
SELECT id, slug, title, type, genre, platform, release_date, poster_url, rating
FROM works
WHERE release_date >= CURRENT_DATE
ORDER BY release_date ASC;

-- ============================================================
-- 실행 완료! Table Editor에서 확인하세요.
-- ============================================================
