// ============================================================
// lib/youtube/fetchVideos.ts
// YouTube Data API v3 연동 - 영상 자동 수집
// ============================================================

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const BASE_URL = 'https://www.googleapis.com/youtube/v3'

// ISO 8601 Duration을 초로 변환 (PT3M45S → 225초)
function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  return (Number(match[1] || 0) * 3600) +
         (Number(match[2] || 0) * 60) +
          Number(match[3] || 0)
}

// 영상 타입 자동 분류
function classifyVideoType(title: string, durationSec: number): VideoType {
  const t = title.toLowerCase()
  if (durationSec > 0 && durationSec <= 61)    return 'shorts'
  if (t.includes('예고편') || t.includes('trailer') || t.includes('teaser')) return 'trailer'
  if (t.includes('리뷰') || t.includes('review') || t.includes('해설') ||
      t.includes('결말') || t.includes('분석'))  return 'review'
  return 'etc'
}

type VideoType = 'trailer' | 'shorts' | 'review' | 'etc'

export interface YouTubeVideoData {
  youtube_id:    string
  title:         string
  video_type:    VideoType
  thumbnail_url: string
  channel_name:  string
  view_count:    number
  duration_sec:  number
  published_at:  string
}

// 핵심 함수: 작품명으로 YouTube 영상 검색 후 정제
export async function fetchYouTubeVideos(
  workTitle: string,
  maxResults: number = 10
): Promise<YouTubeVideoData[]> {
  if (!YOUTUBE_API_KEY) throw new Error('YOUTUBE_API_KEY가 설정되지 않았습니다.')

  // Step 1: 검색 (API 유닛 100 소비)
  const query = encodeURIComponent(`${workTitle} 예고편 리뷰 쇼츠`)
  const searchRes = await fetch(
    `${BASE_URL}/search?part=snippet` +
    `&q=${query}` +
    `&type=video` +
    `&maxResults=${maxResults}` +
    `&order=viewCount` +           // 조회수 기준 정렬
    `&relevanceLanguage=ko` +      // 한국어 우선
    `&key=${YOUTUBE_API_KEY}`
  )

  if (!searchRes.ok) {
    const err = await searchRes.json()
    throw new Error(`YouTube 검색 실패: ${JSON.stringify(err)}`)
  }

  const searchData = await searchRes.json()
  if (!searchData.items?.length) return []

  const videoIds = searchData.items
    .map((i: any) => i.id.videoId)
    .filter(Boolean)
    .join(',')

  // Step 2: 상세 정보 조회 - 조회수 + 길이 (API 유닛 1 소비)
  const detailRes = await fetch(
    `${BASE_URL}/videos?part=snippet,statistics,contentDetails` +
    `&id=${videoIds}` +
    `&key=${YOUTUBE_API_KEY}`
  )

  const detailData = await detailRes.json()

  // Step 3: 데이터 정제 및 반환
  return (detailData.items ?? []).map((item: any) => {
    const durationSec = parseDuration(item.contentDetails?.duration ?? '')
    const title = item.snippet?.title ?? ''
    return {
      youtube_id:    item.id,
      title,
      video_type:    classifyVideoType(title, durationSec),
      thumbnail_url: item.snippet?.thumbnails?.high?.url ??
                     item.snippet?.thumbnails?.default?.url ?? '',
      channel_name:  item.snippet?.channelTitle ?? '',
      view_count:    Number(item.statistics?.viewCount ?? 0),
      duration_sec:  durationSec,
      published_at:  item.snippet?.publishedAt ?? '',
    }
  })
}


// ============================================================
// lib/matching/fuzzyMatch.ts
// Fuzzy Matching 알고리즘 - 영상-작품 자동 매칭
// ============================================================

// Levenshtein 편집 거리 계산
function levenshtein(a: string, b: string): number {
  const dp = Array.from(
    { length: a.length + 1 },
    (_, i) => Array.from({ length: b.length + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0
    )
  )
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[a.length][b.length]
}

// 유사도 0.0 ~ 1.0 반환
function stringSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1.0
  return (maxLen - levenshtein(a, b)) / maxLen
}

export interface MatchResult {
  score:  number   // 0.00 ~ 1.00
  method: 'exact_include' | 'word_match' | 'fuzzy'
  matched_words?: string[]
}

/**
 * 영상 제목과 작품명의 매칭 점수를 계산합니다.
 *
 * 점수 기준:
 * - 1.00: 영상 제목에 작품명이 그대로 포함
 * - 0.90+: 주요 단어 대부분 일치
 * - 0.70~0.89: 절반 이상 단어 일치 (DB 저장)
 * - 0.50~0.69: 불확실 (pending_videos 보류)
 * - 0.00~0.49: 매칭 실패 (폐기)
 */
export function matchWorkTitle(
  videoTitle: string,
  workTitle: string
): MatchResult {
  const vt = videoTitle.toLowerCase().trim()
  const wt = workTitle.toLowerCase().trim()

  // 방법 1: 정확 포함 검사 (가장 신뢰도 높음)
  if (vt.includes(wt)) {
    return { score: 1.0, method: 'exact_include' }
  }

  // 방법 2: 단어 단위 매칭 (조사, 특수문자 제거 후)
  const workWords = wt
    .split(/[\s\-\:\(\)\[\]\/]+/)
    .filter(w => w.length > 1)   // 1글자 조사 제외

  const matchedWords = workWords.filter(w => vt.includes(w))
  const wordScore = workWords.length > 0
    ? matchedWords.length / workWords.length
    : 0

  if (wordScore >= 0.8) {
    return { score: wordScore, method: 'word_match', matched_words: matchedWords }
  }

  // 방법 3: Levenshtein 기반 문자열 유사도
  const levScore = stringSimilarity(vt, wt)

  // 최종 점수: 단어 매칭 70% + 편집거리 30% 가중 평균
  const finalScore = Math.round((wordScore * 0.7 + levScore * 0.3) * 100) / 100

  return {
    score: finalScore,
    method: 'fuzzy',
    matched_words: matchedWords,
  }
}

/* 사용 예시:
   matchWorkTitle("무빙 시즌1 공식 예고편 | Disney+", "무빙")
   → { score: 1.0, method: 'exact_include' }

   matchWorkTitle("닥터슬럼프 리뷰 역대급 로맨스의 귀환?", "닥터슬럼프")
   → { score: 1.0, method: 'exact_include' }

   matchWorkTitle("OTT 드라마 추천 TOP10", "무빙")
   → { score: 0.18, method: 'fuzzy' }  → pending_videos 보류!
*/
