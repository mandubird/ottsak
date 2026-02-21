# 옽싹 (OTSAK) 플랫폼 개발 명세서
## Cursor AI 전달용 프롬프트 문서

---

## 📋 프로젝트 개요

**프로젝트명**: 옽싹 (OTSAK) - OTT 작품 판단 허브 플랫폼  
**목표**: 사용자가 OTT 작품을 시청하기 전에 작품 정보, 평점, 예고편, 쇼츠, 리뷰 반응을 한 화면에서 확인하고 시청 여부를 결정할 수 있는 서비스  
**핵심 컨셉**: "보기 전에 판단한다"

---

## 🛠 기술 스택

### Frontend
- **Next.js 14+** (App Router)
- **TypeScript**
- **TailwindCSS**
- **SSR + ISR** 적용

### Backend / Database
- **Supabase** (PostgreSQL)
- **Supabase Auth** (향후 확장)
- **Row Level Security** (RLS)

### External APIs
- **YouTube Data API v3** (영상 수집)
- **TMDB API** (작품 메타데이터)

### Automation
- **Vercel Cron Jobs** (일일 자동 수집)
- **서버리스 함수**

### Deployment
- **Vercel** (호스팅)
- **도메인**: otsak.com (예정)

---

## 📊 데이터베이스 설계

### 테이블 구조

#### 1. `works` (작품)
```sql
CREATE TABLE works (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text UNIQUE NOT NULL,              -- URL용 (예: avengers-endgame)
  title        text NOT NULL,                     -- 작품명
  title_en     text,                              -- 영문명 (YouTube 검색용)
  type         text NOT NULL CHECK (type IN ('movie', 'series')),
  genre        text[],                            -- 장르 배열
  platform     text[],                            -- OTT 플랫폼 배열
  release_date date,
  rating       numeric(3,1),                      -- 평점 0.0~10.0
  poster_url   text,
  backdrop_url text,
  overview     text,                              -- 줄거리
  tmdb_id      integer UNIQUE,                    -- TMDB ID (중복 방지)
  view_count   integer DEFAULT 0,                 -- 페이지 조회수
  is_featured  boolean DEFAULT false,             -- 홈 화제 작품
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);
```

#### 2. `videos` (YouTube 영상)
```sql
CREATE TABLE videos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id       uuid NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  youtube_id    text UNIQUE NOT NULL,             -- YouTube ID
  title         text NOT NULL,
  video_type    text DEFAULT 'etc' 
                CHECK (video_type IN ('trailer', 'shorts', 'review', 'etc')),
  thumbnail_url text,
  channel_name  text,
  view_count    bigint DEFAULT 0,                 -- YouTube 조회수
  duration_sec  integer,                          -- 영상 길이(초)
  match_score   numeric(3,2),                     -- 매칭 정확도 0.00~1.00
  published_at  timestamptz,
  created_at    timestamptz DEFAULT now()
);
```

#### 3. `pending_videos` (매칭 보류)
```sql
CREATE TABLE pending_videos (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id         text NOT NULL,
  title              text,
  guessed_work_title text,                        -- 추측 작품명
  match_score        numeric(3,2),                -- 70% 미만 점수
  raw_data           jsonb,                       -- API 원본 응답
  reviewed           boolean DEFAULT false,       -- 검토 완료 여부
  created_at         timestamptz DEFAULT now()
);
```

### 인덱스 설계
```sql
-- works
CREATE INDEX idx_works_slug ON works(slug);
CREATE INDEX idx_works_genre ON works USING gin(genre);
CREATE INDEX idx_works_platform ON works USING gin(platform);
CREATE INDEX idx_works_release_desc ON works(release_date DESC NULLS LAST);
CREATE INDEX idx_works_view_count ON works(view_count DESC);
CREATE INDEX idx_works_tmdb_id ON works(tmdb_id);

-- videos
CREATE INDEX idx_videos_work_id ON videos(work_id);
CREATE INDEX idx_videos_type ON videos(video_type);
CREATE INDEX idx_videos_view_desc ON videos(view_count DESC);
CREATE INDEX idx_videos_youtube_id ON videos(youtube_id);
CREATE INDEX idx_videos_work_type ON videos(work_id, video_type);
```

---

## 🗂 프로젝트 폴더 구조

```
otsak/
├── app/
│   ├── layout.tsx                      # 루트 레이아웃
│   ├── page.tsx                        # 홈 페이지
│   ├── globals.css
│   ├── works/
│   │   ├── page.tsx                    # 작품 목록
│   │   └── [slug]/
│   │       └── page.tsx                # 작품 상세
│   ├── videos/
│   │   └── page.tsx                    # 영상 허브
│   ├── schedule/
│   │   └── page.tsx                    # 공개 일정 달력
│   ├── api/
│   │   ├── works/
│   │   │   └── route.ts                # GET /api/works (목록)
│   │   ├── videos/
│   │   │   └── route.ts                # GET /api/videos (영상 목록)
│   │   └── cron/
│   │       └── sync-videos/
│   │           └── route.ts            # Cron Job (자동 수집)
│   └── sitemap.ts                      # 자동 sitemap 생성
│
├── components/
│   ├── WorkCard.tsx                    # 작품 카드 컴포넌트
│   ├── WorkHero.tsx                    # 작품 상세 히어로
│   ├── VideoHub.tsx                    # 영상 허브
│   ├── VideoCard.tsx                   # 영상 카드
│   ├── FilterBar.tsx                   # 필터 바
│   └── CalendarView.tsx                # 달력 뷰
│
├── lib/
│   ├── supabase/
│   │   ├── server.ts                   # 서버 클라이언트
│   │   └── client.ts                   # 클라이언트 (브라우저용)
│   ├── youtube/
│   │   └── fetchVideos.ts              # YouTube API 수집
│   ├── matching/
│   │   └── fuzzyMatch.ts               # Fuzzy Matching 엔진
│   └── tmdb/
│       └── fetchWork.ts                # TMDB API (선택)
│
├── types/
│   └── database.ts                     # Supabase 타입 정의
│
├── public/
│   └── images/
│
├── .env.local                          # 환경변수 (gitignore)
├── vercel.json                         # Vercel Cron 설정
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🎯 MVP 기능 명세

### 1. 홈 페이지 (`/`)
**UI 구성**:
- 히어로 섹션 (큰 배너 + 타이틀 "보기 전에 판단한다")
- 지금 화제 작품 (is_featured = true인 작품 4~6개)
- 최근 등록 작품 (created_at 기준 내림차순 8개)
- 공개 예정 작품 (release_date 기준 미래 4개)

**데이터 페칭**:
```typescript
// SSR
const { data: featured } = await supabase
  .from('works')
  .select('*')
  .eq('is_featured', true)
  .limit(6)

const { data: recent } = await supabase
  .from('works')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(8)
```

---

### 2. 작품 목록 페이지 (`/works`)
**UI 구성**:
- 필터 바 (장르, 영화/시리즈, 정렬)
- 작품 카드 그리드 (4열 레이아웃)
- 페이지네이션

**필터 옵션**:
- 장르: 전체, 액션, 드라마, 코미디, SF, 로맨스, 스릴러 등
- 타입: 전체, 영화, 시리즈
- 정렬: 최신순, 인기순(조회수), 평점순

**API 호출**:
```typescript
GET /api/works?genre=액션&type=movie&sort=latest&page=1&limit=20
```

---

### 3. 작품 상세 페이지 (`/works/[slug]`)
**UI 구성**:
- 상단: 배경 이미지 + 포스터 + 기본 정보
  - 제목 (한글 + 영문)
  - 장르 태그
  - 평점 (별 아이콘)
  - 공개일
  - 플랫폼 로고
  - 줄거리
- 중단: 영상 허브 (탭: 전체/예고편/쇼츠/리뷰)
  - 영상 카드 그리드 (썸네일 + 제목 + 채널명 + 조회수)
  - 클릭 시 YouTube 새 탭 열기

**데이터 페칭** (SSR):
```typescript
const { data: work } = await supabase
  .from('works')
  .select(`
    *,
    videos (
      id, youtube_id, title, video_type,
      thumbnail_url, view_count, channel_name, duration_sec
    )
  `)
  .eq('slug', params.slug)
  .order('view_count', { foreignTable: 'videos', ascending: false })
  .single()
```

**Dynamic Metadata**:
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const work = await getWork(params.slug)
  return {
    title: `${work.title} — 옽싹에서 미리 판단하기`,
    description: work.overview?.substring(0, 160),
    openGraph: {
      title: work.title,
      description: work.overview,
      images: [{ url: work.poster_url }],
    },
  }
}
```

---

### 4. 영상 허브 페이지 (`/videos`)
**UI 구성**:
- 탭 필터: 전체 / 예고편 / 쇼츠 / 리뷰
- 영상 카드 그리드
- 각 카드에 연결된 작품명 표시
- 클릭 시 작품 상세 페이지로 이동

**데이터 페칭**:
```typescript
const { data: videos } = await supabase
  .from('videos')
  .select(`
    *,
    works (slug, title, poster_url)
  `)
  .eq('video_type', selectedType)
  .order('view_count', { ascending: false })
  .limit(50)
```

---

### 5. 공개 일정 페이지 (`/schedule`)
**UI 구성**:
- 달력 형식 (react-calendar 또는 직접 구현)
- 날짜 클릭 시 해당 날짜 작품 목록 표시
- 작품 카드 클릭 시 상세 페이지 이동

**데이터 페칭**:
```typescript
const { data: upcoming } = await supabase
  .from('works')
  .select('*')
  .gte('release_date', new Date().toISOString())
  .order('release_date', { ascending: true })
```

---

## 🤖 자동화 로직

### YouTube 영상 자동 수집 (Cron Job)

**실행 시간**: 매일 오전 3시 (KST)

**로직**:
1. 최근 30일 내 등록된 작품 조회 (`works` 테이블)
2. 각 작품의 `title_en` (또는 `title`)로 YouTube 검색
   - 검색어: `{작품명} 예고편 리뷰 쇼츠`
   - 최대 10개 결과
   - 조회수 기준 정렬
3. 각 영상에 대해 Fuzzy Matching 수행
   - 점수 **≥ 0.70**: `videos` 테이블에 저장 ✅
   - 점수 **0.50 ~ 0.69**: `pending_videos` 보류 ⚠️
   - 점수 **< 0.50**: 폐기 ❌
4. 중복 방지: `youtube_id`로 `upsert` 사용
5. API 과부하 방지: 요청 간 500ms 딜레이

**Fuzzy Matching 알고리즘**:
```typescript
export function matchWorkTitle(videoTitle: string, workTitle: string) {
  const vt = videoTitle.toLowerCase().trim()
  const wt = workTitle.toLowerCase().trim()

  // 1. 정확 포함 검사
  if (vt.includes(wt)) return { score: 1.0, method: 'exact_include' }

  // 2. 단어 단위 매칭
  const workWords = wt.split(/[\s\-\:\(\)]+/).filter(w => w.length > 1)
  const matchedWords = workWords.filter(w => vt.includes(w))
  const wordScore = matchedWords.length / workWords.length

  if (wordScore >= 0.8) return { score: wordScore, method: 'word_match' }

  // 3. Levenshtein 거리 기반 유사도
  const levScore = stringSimilarity(vt, wt)
  const finalScore = wordScore * 0.7 + levScore * 0.3

  return { score: Math.round(finalScore * 100) / 100, method: 'fuzzy' }
}
```

**Cron Job Endpoint**: `POST /api/cron/sync-videos`
- 헤더: `Authorization: Bearer {CRON_SECRET}`
- 반환: `{ synced: number, pending: number, skipped: number }`

---

## 🎨 디자인 요구사항

### 컬러 스킴
```css
--bg: #0a0a0f;           /* 다크 배경 */
--surface: #111118;       /* 카드 배경 */
--border: #2a2a3a;        /* 테두리 */
--accent: #ff4d6d;        /* 주요 강조 (핑크) */
--accent2: #7c3aed;       /* 보조 강조 (퍼플) */
--text: #e8e8f0;          /* 텍스트 */
--text-muted: #6b6b8a;    /* 보조 텍스트 */
```

### 타이포그래피
- **헤딩**: 'Bebas Neue' 또는 'Montserrat' (Bold, 대문자)
- **본문**: 'Noto Sans KR' 또는 'Pretendard'
- **코드/데이터**: 'JetBrains Mono'

### 레이아웃
- 최대 너비: 1200px (중앙 정렬)
- 카드 그리드: 4열 (데스크톱) → 2열 (태블릿) → 1열 (모바일)
- 카드 디자인:
  - 호버 시 `translateY(-4px)` + 그림자 효과
  - 포스터 비율: 2:3 (영화 포스터 표준)
  - 둥근 모서리: `border-radius: 12px`

### 애니메이션
- 페이지 전환: fade-in (0.3s)
- 카드 호버: transform (0.2s)
- 스켈레톤 로딩: pulse 애니메이션

---

## 🔌 API 명세

### 1. GET /api/works
**설명**: 작품 목록 조회 (필터, 정렬, 페이지네이션)

**Query Parameters**:
- `genre`: 장르 필터 (예: `액션`)
- `type`: 타입 필터 (`movie` | `series`)
- `sort`: 정렬 (`latest` | `popular` | `rating`)
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 개수 (기본값: 20, 최대: 100)

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "moving",
      "title": "무빙",
      "type": "series",
      "genre": ["액션", "드라마"],
      "platform": ["Disney+"],
      "release_date": "2023-08-09",
      "rating": 8.5,
      "poster_url": "https://...",
      "view_count": 1234
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

**캐싱**: ISR 60초

---

### 2. GET /api/works/[slug]
**설명**: 작품 상세 조회 (관련 영상 포함)

**Response**:
```json
{
  "id": "uuid",
  "slug": "moving",
  "title": "무빙",
  "title_en": "Moving",
  "overview": "초능력을 숨기고...",
  "videos": [
    {
      "id": "uuid",
      "youtube_id": "abc123",
      "title": "무빙 공식 예고편",
      "video_type": "trailer",
      "thumbnail_url": "https://...",
      "view_count": 5000000,
      "channel_name": "Disney+ Korea",
      "duration_sec": 180
    }
  ]
}
```

**캐싱**: ISR 300초

---

### 3. GET /api/videos
**설명**: 영상 목록 조회

**Query Parameters**:
- `type`: 영상 타입 필터 (`trailer` | `shorts` | `review` | `etc`)
- `work_id`: 특정 작품의 영상만 조회
- `limit`: 개수 (기본값: 50)

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "youtube_id": "abc123",
      "title": "무빙 리뷰",
      "video_type": "review",
      "work": {
        "slug": "moving",
        "title": "무빙",
        "poster_url": "https://..."
      }
    }
  ]
}
```

**캐싱**: ISR 60초

---

## 🚀 개발 순서 (Cursor AI 작업 지시)

### Phase 1: 프로젝트 초기 설정 (30분)
```
✅ Next.js 14 프로젝트 생성 (App Router, TypeScript, TailwindCSS)
✅ 필수 패키지 설치
   - @supabase/supabase-js
   - @supabase/ssr
✅ 환경변수 파일 생성 (.env.local)
✅ Supabase 클라이언트 설정 (lib/supabase/server.ts, client.ts)
✅ TailwindCSS 커스텀 설정 (색상, 폰트)
✅ 글로벌 스타일 설정 (app/globals.css)
```

**Cursor AI 프롬프트**:
```
Create a new Next.js 14 project with App Router, TypeScript, and TailwindCSS.
Install @supabase/supabase-js and @supabase/ssr.
Set up Supabase client for both server and client components.
Configure TailwindCSS with the following colors:
- bg: #0a0a0f
- surface: #111118
- border: #2a2a3a
- accent: #ff4d6d
- accent2: #7c3aed
- text: #e8e8f0
- text-muted: #6b6b8a

Create lib/supabase/server.ts and lib/supabase/client.ts using the provided code.
```

---

### Phase 2: 데이터베이스 연동 & 타입 생성 (20분)
```
✅ Supabase CLI 설치 및 로그인
✅ types/database.ts 생성 (자동 타입 생성)
✅ 테스트 데이터 페칭 함수 작성
✅ 연결 테스트
```

**Cursor AI 프롬프트**:
```
Generate TypeScript types from Supabase database schema.
Create types/database.ts with the following tables: works, videos, pending_videos.
Write a test function to fetch works from Supabase and display in console.
```

---

### Phase 3: 컴포넌트 개발 (2~3시간)
```
✅ WorkCard.tsx (작품 카드)
   - 포스터, 제목, 장르, 평점, 플랫폼
   - 호버 애니메이션
✅ VideoCard.tsx (영상 카드)
   - 썸네일, 제목, 채널, 조회수, 타입 배지
✅ FilterBar.tsx (필터 바)
   - 장르 드롭다운
   - 타입 토글
   - 정렬 셀렉트
✅ WorkHero.tsx (작품 상세 히어로)
   - 배경 이미지 (backdrop) + 그라디언트 오버레이
   - 좌측 포스터
   - 우측 정보 (제목, 평점, 장르, 플랫폼, 줄거리)
✅ VideoHub.tsx (영상 허브)
   - 탭 (전체/예고편/쇼츠/리뷰)
   - 영상 카드 그리드
```

**Cursor AI 프롬프트**:
```
Create the following React components with TypeScript and TailwindCSS:

1. WorkCard component:
   - Display poster, title, genre tags, rating, and platform logos
   - Hover effect: lift card with shadow
   - Click to navigate to /works/[slug]

2. VideoCard component:
   - Display thumbnail, title, channel name, view count, duration badge
   - Video type badge (trailer/shorts/review)
   - Click to open YouTube in new tab

3. FilterBar component:
   - Genre dropdown (전체, 액션, 드라마, 코미디, SF, 로맨스)
   - Type toggle (영화/시리즈)
   - Sort select (최신순, 인기순, 평점순)
   - Apply button

4. WorkHero component:
   - Full-width backdrop image with gradient overlay
   - Left: poster image
   - Right: title, rating stars, genre tags, platform logos, overview

5. VideoHub component:
   - Tab buttons (전체/예고편/쇼츠/리뷰)
   - Video card grid (4 columns)
   - Filter videos by type

Use the color scheme from globals.css.
All components should be mobile-responsive.
```

---

### Phase 4: 페이지 개발 (3~4시간)
```
✅ app/page.tsx (홈)
   - 히어로 섹션
   - 화제 작품 섹션
   - 최근 등록 작품 섹션
   - 공개 예정 작품 섹션
✅ app/works/page.tsx (작품 목록)
   - FilterBar 통합
   - WorkCard 그리드
   - 페이지네이션
   - SSR + ISR
✅ app/works/[slug]/page.tsx (작품 상세)
   - WorkHero
   - VideoHub
   - Dynamic metadata
   - SSR + ISR
✅ app/videos/page.tsx (영상 허브)
   - 탭 필터
   - VideoCard 그리드
✅ app/schedule/page.tsx (공개 일정)
   - 달력 뷰 (선택: react-calendar 또는 직접 구현)
   - 날짜별 작품 목록
```

**Cursor AI 프롬프트**:
```
Create the following Next.js App Router pages:

1. app/page.tsx (Home):
   - Hero section with title "보기 전에 판단한다"
   - Featured works section (is_featured = true, limit 6)
   - Recent works section (order by created_at desc, limit 8)
   - Upcoming works section (release_date >= today, limit 4)
   - Use SSR to fetch data from Supabase
   - Apply ISR with revalidate = 60

2. app/works/page.tsx (Work List):
   - Integrate FilterBar component
   - Display WorkCard grid (4 columns)
   - Implement pagination
   - Fetch from /api/works with query params
   - Use SSR + ISR

3. app/works/[slug]/page.tsx (Work Detail):
   - Use WorkHero component with work data
   - Use VideoHub component with work.videos
   - Implement generateMetadata for SEO
   - Fetch work with related videos using Supabase join
   - Apply ISR with revalidate = 300

4. app/videos/page.tsx (Video Hub):
   - Tab filter (전체/예고편/쇼츠/리뷰)
   - Display VideoCard grid
   - Show related work info on each card
   - Link to work detail page

5. app/schedule/page.tsx (Release Schedule):
   - Display calendar view
   - Show upcoming works grouped by date
   - Click date to filter works
   - Use upcoming_works view from database

All pages must be mobile-responsive.
Use TypeScript strict mode.
Implement loading states with skeleton loaders.
```

---

### Phase 5: API Routes 개발 (1~2시간)
```
✅ app/api/works/route.ts (작품 목록 API)
   - 필터, 정렬, 페이지네이션
   - ISR 60초
✅ app/api/videos/route.ts (영상 목록 API)
   - 타입 필터
   - work_id 필터
   - ISR 60초
✅ app/api/cron/sync-videos/route.ts (Cron Job)
   - YouTube API 수집
   - Fuzzy Matching
   - DB 저장
   - 인증 체크
```

**Cursor AI 프롬프트**:
```
Create the following API routes:

1. app/api/works/route.ts:
   - GET endpoint with query params: genre, type, sort, page, limit
   - Fetch from Supabase with filters and pagination
   - Return { data: Work[], meta: { total, page, limit, totalPages } }
   - Apply ISR revalidate = 60

2. app/api/videos/route.ts:
   - GET endpoint with query params: type, work_id, limit
   - Fetch videos with related work info
   - Return { data: Video[] }
   - Apply ISR revalidate = 60

3. app/api/cron/sync-videos/route.ts:
   - GET endpoint (called by Vercel Cron)
   - Check authorization header: Bearer {CRON_SECRET}
   - Fetch recent works (last 30 days)
   - For each work, call fetchYouTubeVideos()
   - For each video, apply matchWorkTitle()
   - If score >= 0.7: upsert to videos table
   - If score 0.5~0.69: upsert to pending_videos table
   - If score < 0.5: skip
   - Add 500ms delay between API calls
   - Return { synced, pending, skipped, errors }

Use the provided fetchYouTubeVideos and matchWorkTitle functions.
```

---

### Phase 6: YouTube & Matching 유틸리티 (1시간)
```
✅ lib/youtube/fetchVideos.ts
   - YouTube Data API v3 연동
   - 검색 + 상세 정보 조회
   - duration 파싱
   - video_type 자동 분류
✅ lib/matching/fuzzyMatch.ts
   - Levenshtein 거리 계산
   - 단어 단위 매칭
   - 최종 점수 산출
```

**Cursor AI 프롬프트**:
```
Create lib/youtube/fetchVideos.ts:
- Function: fetchYouTubeVideos(workTitle: string, maxResults: number)
- Use YouTube Data API v3 (process.env.YOUTUBE_API_KEY)
- Search endpoint: /search with query "{workTitle} 예고편 리뷰 쇼츠"
- Videos endpoint: /videos to get view count and duration
- Parse ISO 8601 duration (PT3M45S) to seconds
- Classify video type based on title and duration:
  - duration <= 61: 'shorts'
  - title includes '예고편'|'trailer': 'trailer'
  - title includes '리뷰'|'review'|'해설': 'review'
  - else: 'etc'
- Return YouTubeVideoData[]

Create lib/matching/fuzzyMatch.ts:
- Function: matchWorkTitle(videoTitle: string, workTitle: string)
- Step 1: Check if workTitle is exactly included in videoTitle → score 1.0
- Step 2: Split workTitle into words, count how many are in videoTitle
- Step 3: Calculate Levenshtein distance
- Final score: wordScore * 0.7 + levScore * 0.3
- Return { score: number (0-1), method: string }

Use TypeScript with strict types.
Handle errors gracefully.
```

---

### Phase 7: SEO & 메타데이터 (30분)
```
✅ app/sitemap.ts (자동 sitemap 생성)
✅ app/layout.tsx (기본 metadata 설정)
✅ app/robots.txt
✅ 각 페이지별 generateMetadata 함수
```

**Cursor AI 프롬프트**:
```
Implement SEO optimization:

1. Create app/sitemap.ts:
   - Fetch all works with slug and updated_at
   - Generate sitemap with:
     - Homepage: priority 1.0, daily
     - /works: priority 0.9, daily
     - /videos: priority 0.8, daily
     - /schedule: priority 0.7, weekly
     - Each work page: priority 0.8, weekly

2. Update app/layout.tsx with default metadata:
   - title: "옽싹 | OTT 작품 판단 허브"
   - description: "보기 전에 판단한다. 예고편, 리뷰, 평점을 한눈에."
   - keywords: OTT, 넷플릭스, 드라마, 영화, 예고편
   - openGraph with siteName and locale ko_KR

3. Create app/robots.txt:
   - Allow all crawlers
   - Sitemap location

4. Implement generateMetadata in app/works/[slug]/page.tsx:
   - Dynamic title: "{work.title} — 옽싹에서 미리 판단하기"
   - Description from work.overview (160 chars)
   - OpenGraph with poster image
```

---

### Phase 8: Vercel 배포 설정 (10분)
```
✅ vercel.json (Cron Job 설정)
✅ next.config.js (이미지 도메인 허용)
✅ 환경변수 설정 가이드
```

**Cursor AI 프롬프트**:
```
Create deployment configuration:

1. vercel.json:
{
  "crons": [
    {
      "path": "/api/cron/sync-videos",
      "schedule": "0 3 * * *"
    }
  ]
}

2. next.config.js:
- Add image domains: ['image.tmdb.org', 'i.ytimg.com']
- Configure output: 'standalone' for Vercel

3. Create .env.example with all required variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- YOUTUBE_API_KEY
- TMDB_API_KEY
- CRON_SECRET
```

---

## 📝 환경변수 설정

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# YouTube API
YOUTUBE_API_KEY=AIzaSy...

# TMDB API (선택)
TMDB_API_KEY=abc123...

# Cron 인증
CRON_SECRET=change-this-to-random-string
```

---

## ✅ 완료 체크리스트

### 개발 완료 기준
- [ ] 모든 페이지가 정상적으로 렌더링됨
- [ ] Supabase에서 데이터를 정상적으로 불러옴
- [ ] 필터와 정렬이 올바르게 작동함
- [ ] 모바일 반응형이 정상 작동함
- [ ] 작품 상세 페이지에서 영상이 표시됨
- [ ] YouTube 링크 클릭 시 새 탭에서 열림
- [ ] 로딩 상태가 스켈레톤으로 표시됨
- [ ] 에러 핸들링이 구현됨
- [ ] SEO 메타데이터가 올바르게 설정됨
- [ ] Vercel에 배포 가능한 상태임

### 테스트 항목
- [ ] 홈 페이지에서 작품 클릭 → 상세 페이지 이동 ✅
- [ ] 작품 목록 필터링 (장르, 타입, 정렬) ✅
- [ ] 작품 상세 페이지 영상 탭 전환 ✅
- [ ] 영상 카드 클릭 → YouTube 새 탭 열림 ✅
- [ ] 공개 일정 달력에서 날짜 선택 ✅
- [ ] 모바일에서 레이아웃 깨지지 않음 ✅

---

## 🎯 최종 전달 사항

**Cursor AI에게 이렇게 요청하세요**:

```
I need you to build a full-stack Next.js 14 application based on this specification document.

Project: OTSAK - OTT Works Judgment Hub Platform
Tech Stack: Next.js 14 (App Router), TypeScript, TailwindCSS, Supabase

Please follow the development phases in order:
1. Project setup with Supabase integration
2. Database type generation
3. Component development (WorkCard, VideoCard, FilterBar, WorkHero, VideoHub)
4. Page development (Home, Works List, Work Detail, Videos, Schedule)
5. API routes (works, videos, cron job)
6. YouTube API integration and Fuzzy Matching utility
7. SEO optimization (sitemap, metadata)
8. Vercel deployment configuration

Refer to the database schema, API specs, and design requirements in this document.
Create all files in the correct folder structure.
Use TypeScript strict mode and follow Next.js 14 best practices.
Implement proper error handling and loading states.
Make all pages mobile-responsive.

Start with Phase 1 and proceed step by step.
```

---

**이 문서를 Cursor AI에게 전달하면, 체계적으로 프로젝트를 구축할 수 있습니다.**
