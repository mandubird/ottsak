/**
 * 한국 OTT 인기 작품 — 자체 인기 엔진 (외부 랭킹 API 없음)
 *
 * 후보: TMDB (트렌딩/한국 OTT 인기) → 순위: YouTube 기반 점수
 * - 작품명 + 예고편 검색, 조회수 합 + 공식 채널 가중치
 * - "요즘 많이 보는 콘텐츠" 체감 인기와 유사
 *
 * JustWatch 포기 → 독립적·무료·중단 리스크 없음
 */

import { fetchWorksInKorea, type TmdbWorkRow } from '@/lib/tmdb/fetchWorks'
import { getYouTubeEngagementScore } from '@/lib/youtube/fetchVideos'

export interface PopularItem {
  title: string
  title_en: string | null
  /** YouTube 기반 인기 점수 (조회수 합 + 공식 채널 가중치) */
  score: number
  platformNames: string[]
  tmdb?: TmdbWorkRow
}

const CANDIDATE_LIMIT = 20
const TOP_N = 10
const DELAY_MS = 300

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * TMDB 후보 수집 → 작품별 YouTube 인기 점수 계산 → 점수 순 TOP10 반환
 */
export async function fetchPopularInKorea(): Promise<PopularItem[]> {
  const rows = await fetchWorksInKorea(10, 10)
  const candidates = rows.slice(0, CANDIDATE_LIMIT)

  const withScore: Array<PopularItem & { score: number }> = []
  for (const r of candidates) {
    const searchTitle = r.title_en || r.title
    const score = await getYouTubeEngagementScore(searchTitle)
    await sleep(DELAY_MS)
    withScore.push({
      title: r.title,
      title_en: r.title_en,
      score,
      platformNames: r.platform ?? [],
      tmdb: r,
    })
  }

  withScore.sort((a, b) => b.score - a.score)
  return withScore.slice(0, TOP_N)
}
