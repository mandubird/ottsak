/**
 * YouTube Data API v3 - 영상 검색 및 상세 조회
 */

const BASE_URL = 'https://www.googleapis.com/youtube/v3'

export type VideoType = 'trailer' | 'shorts' | 'review' | 'etc'

export interface YouTubeVideoData {
  youtube_id: string
  title: string
  video_type: VideoType
  thumbnail_url: string
  channel_name: string
  view_count: number
  duration_sec: number
  published_at: string
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

function classifyVideoType(title: string, durationSec: number): VideoType {
  const t = title.toLowerCase()
  if (durationSec > 0 && durationSec <= 61) return 'shorts'
  if (t.includes('예고편') || t.includes('trailer') || t.includes('teaser'))
    return 'trailer'
  if (
    t.includes('리뷰') ||
    t.includes('review') ||
    t.includes('해설') ||
    t.includes('결말') ||
    t.includes('분석')
  )
    return 'review'
  return 'etc'
}

export async function fetchYouTubeVideos(
  workTitle: string,
  maxResults: number = 10
): Promise<YouTubeVideoData[]> {
  const key = process.env.YOUTUBE_API_KEY
  if (!key) throw new Error('YOUTUBE_API_KEY가 설정되지 않았습니다.')

  const query = encodeURIComponent(`${workTitle} 예고편 리뷰 쇼츠`)
  const searchRes = await fetch(
    `${BASE_URL}/search?part=snippet&q=${query}&type=video&maxResults=${maxResults}&order=viewCount&relevanceLanguage=ko&key=${key}`
  )
  if (!searchRes.ok) {
    const err = await searchRes.json().catch(() => ({}))
    throw new Error(`YouTube 검색 실패: ${JSON.stringify(err)}`)
  }

  const searchData = await searchRes.json()
  const items = searchData.items ?? []
  if (items.length === 0) return []

  const videoIds = items
    .map((i: { id?: { videoId?: string } }) => i.id?.videoId)
    .filter(Boolean)
    .join(',')

  const detailRes = await fetch(
    `${BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${key}`
  )
  const detailData = await detailRes.json()
  const detailItems = detailData.items ?? []

  return detailItems.map((item: Record<string, unknown>) => {
    const snippet = (item.snippet as Record<string, unknown>) ?? {}
    const stats = (item.statistics as Record<string, unknown>) ?? {}
    const content = (item.contentDetails as Record<string, unknown>) ?? {}
    const durationSec = parseDuration((content.duration as string) ?? '')
    const title = (snippet.title as string) ?? ''
    const thumbnails = (snippet.thumbnails as Record<string, { url?: string }>) ?? {}
    const thumb =
      thumbnails.high?.url ?? thumbnails.medium?.url ?? thumbnails.default?.url ?? ''
    return {
      youtube_id: String(item.id ?? ''),
      title,
      video_type: classifyVideoType(title, durationSec),
      thumbnail_url: thumb,
      channel_name: String(snippet.channelTitle ?? ''),
      view_count: Number(stats.viewCount ?? 0),
      duration_sec: durationSec,
      published_at: String(snippet.publishedAt ?? ''),
    }
  })
}
