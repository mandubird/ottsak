/**
 * YouTube Data API v3 — 영상 수집
 *
 * 수집 구조:
 * 1순위: YouTube 공식 채널 (넷플릭스/티빙 등)
 * 2순위: YouTube 일반 업로드 (리뷰/쇼츠)
 * 3순위: TMDB 예고편 (보조)
 *
 * 1단계: [작품명]+예고편, [작품명]+쇼츠, [작품명]+리뷰 각각 검색, order=viewCount
 * 2단계: 공식 채널 가중치 (Netflix, Netflix Korea, TVING 등) → score 보너스
 * 3단계: 제목/길이로 trailer / short / review 자동 분류
 * 4단계: youtube_id unique로 DB 저장
 */

const BASE_URL = 'https://www.googleapis.com/youtube/v3'

export type VideoType = 'trailer' | 'shorts' | 'review' | 'etc'

export interface YouTubeVideoData {
  youtube_id: string
  title: string
  video_type: VideoType
  thumbnail_url: string
  channel_id: string
  channel_name: string
  view_count: number
  duration_sec: number
  published_at: string
  /** 공식 채널이면 true → sync 시 매칭 점수 보너스 적용 */
  is_official_channel: boolean
}

/** 공식 채널(넷플릭스/티빙 등) — 채널명 포함 여부로 판별, 가중치 적용 */
const OFFICIAL_CHANNEL_PATTERNS = [
  'netflix',
  'netflix korea',
  'tving',
  '티빙',
  'disney plus',
  'disney+',
  'wavve',
  '웨이브',
  'watcha',
  '왓챠',
  'coupang play',
  '쿠팡플레이',
]

function isOfficialChannel(channelTitle: string): boolean {
  const lower = channelTitle.toLowerCase().trim()
  return OFFICIAL_CHANNEL_PATTERNS.some((p) => lower.includes(p))
}

function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  return (
    Number(match[1] || 0) * 3600 +
    Number(match[2] || 0) * 60 +
    Number(match[3] || 0)
  )
}

/**
 * 제목·길이 기준 자동 분류
 * 예고/trailer → trailer, short/#shorts → shorts, 리뷰/해설 → review
 */
function classifyVideoType(title: string, durationSec: number): VideoType {
  const t = title.toLowerCase()
  if (t.includes('예고') || t.includes('trailer') || t.includes('teaser'))
    return 'trailer'
  if (t.includes('short') || t.includes('#shorts') || (durationSec > 0 && durationSec <= 61))
    return 'shorts'
  if (t.includes('리뷰') || t.includes('review') || t.includes('해설') || t.includes('결말') || t.includes('분석'))
    return 'review'
  return 'etc'
}

async function searchYouTube(
  key: string,
  q: string,
  options: { maxResults?: number; videoDuration?: 'short' | 'medium' | 'long' } = {}
): Promise<Array<{ id: string; channelId: string; channelTitle: string }>> {
  const params = new URLSearchParams({
    part: 'snippet',
    q,
    type: 'video',
    maxResults: String(options.maxResults ?? 15),
    order: 'viewCount',
    relevanceLanguage: 'ko',
    key,
  })
  if (options.videoDuration) params.set('videoDuration', options.videoDuration)

  const res = await fetch(`${BASE_URL}/search?${params}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`YouTube 검색 실패: ${JSON.stringify(err)}`)
  }
  const data = await res.json()
  const items = data.items ?? []
  return items.map((i: { id?: { videoId?: string }; snippet?: { channelId?: string; channelTitle?: string } }) => ({
    id: i.id?.videoId ?? '',
    channelId: i.snippet?.channelId ?? '',
    channelTitle: i.snippet?.channelTitle ?? '',
  })).filter((x: { id: string }) => x.id)
}

async function getVideoDetails(
  key: string,
  videoIds: string[]
): Promise<Array<{ id: string; snippet: Record<string, unknown>; statistics: Record<string, unknown>; contentDetails: Record<string, unknown> }>> {
  if (videoIds.length === 0) return []
  const res = await fetch(
    `${BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(',')}&key=${key}`
  )
  if (!res.ok) throw new Error('YouTube videos 상세 조회 실패')
  const data = await res.json()
  return data.items ?? []
}

/**
 * 1단계: [작품명]+예고편, [작품명]+쇼츠, [작품명]+리뷰 각각 검색 (order=viewCount)
 * 쇼츠 검색 시 videoDuration=short 적용
 */
export async function fetchYouTubeVideos(
  workTitle: string,
  maxPerQuery: number = 12
): Promise<YouTubeVideoData[]> {
  const key = process.env.YOUTUBE_API_KEY
  if (!key) throw new Error('YOUTUBE_API_KEY가 설정되지 않았습니다.')

  const queries: { q: string; videoDuration?: 'short' }[] = [
    { q: `${workTitle} 예고편` },
    { q: `${workTitle} 쇼츠`, videoDuration: 'short' },
    { q: `${workTitle} 리뷰` },
  ]

  const seenIds = new Set<string>()
  const searchResults: Array<{ id: string; channelId: string; channelTitle: string }> = []

  for (const { q, videoDuration } of queries) {
    const list = await searchYouTube(key, q, { maxResults: maxPerQuery, videoDuration })
    for (const item of list) {
      if (item.id && !seenIds.has(item.id)) {
        seenIds.add(item.id)
        searchResults.push(item)
      }
    }
  }

  if (searchResults.length === 0) return []

  const detailItems = await getVideoDetails(
    key,
    searchResults.map((r) => r.id)
  )

  const byId = new Map(searchResults.map((r) => [r.id, r]))

  return detailItems.map((item: Record<string, unknown>) => {
    const id = String(item.id ?? '')
    const searchMeta = byId.get(id)
    const snippet = (item.snippet as Record<string, unknown>) ?? {}
    const stats = (item.statistics as Record<string, unknown>) ?? {}
    const content = (item.contentDetails as Record<string, unknown>) ?? {}
    const durationSec = parseDuration((content.duration as string) ?? '')
    const title = (snippet.title as string) ?? ''
    const channelId = (snippet.channelId as string) ?? searchMeta?.channelId ?? ''
    const channelTitle = (snippet.channelTitle as string) ?? searchMeta?.channelTitle ?? ''
    const thumbnails = (snippet.thumbnails as Record<string, { url?: string }>) ?? {}
    const thumb = thumbnails.high?.url ?? thumbnails.medium?.url ?? thumbnails.default?.url ?? ''

    return {
      youtube_id: id,
      title,
      video_type: classifyVideoType(title, durationSec),
      thumbnail_url: thumb,
      channel_id: channelId,
      channel_name: channelTitle,
      view_count: Number(stats.viewCount ?? 0),
      duration_sec: durationSec,
      published_at: String(snippet.publishedAt ?? ''),
      is_official_channel: isOfficialChannel(channelTitle),
    }
  })
}

/**
 * 랭킹용 — 작품명 기준 YouTube 인기 점수 (예고편 검색, 조회수 합 + 공식 채널 가중치)
 * 외부 API(JustWatch) 없이 "요즘 많이 보는 콘텐츠" 체감 인기 산출
 */
export async function getYouTubeEngagementScore(workTitle: string): Promise<number> {
  const key = process.env.YOUTUBE_API_KEY
  if (!key) return 0

  const list = await searchYouTube(key, `${workTitle} 예고편`, { maxResults: 10 })
  if (list.length === 0) return 0

  const details = await getVideoDetails(key, list.map((r) => r.id))
  const byId = new Map(list.map((r) => [r.id, { channelTitle: r.channelTitle }]))

  let score = 0
  for (const item of details as Array<{ id: string; statistics?: { viewCount?: string }; snippet?: { channelTitle?: string }>) {
    const views = Number(item.statistics?.viewCount ?? 0)
    const channelTitle = item.snippet?.channelTitle ?? byId.get(item.id)?.channelTitle ?? ''
    const bonus = isOfficialChannel(channelTitle) ? 1.5 : 1
    score += Math.round(views * bonus)
  }
  return score
}
