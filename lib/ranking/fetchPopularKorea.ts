/**
 * 한국 OTT 인기 작품 수집 — 랭킹용
 *
 * 1순위: JustWatch API (country=KR, Netflix/TVING/Disney+/Coupang Play, 상위 20)
 * 2순위: TMDB (JustWatch 토큰 없을 때 MVP 폴백) — 한국 인기순 상위 20
 *
 * 점수 normalize 후 TOP10 선정은 호출측(주간 Cron)에서 처리.
 */

import {
  fetchWorksInKorea,
  type TmdbWorkRow,
} from '@/lib/tmdb/fetchWorks'

export interface PopularItem {
  /** TMDB 기준 제목(한글) */
  title: string
  title_en: string | null
  /** 정규화 전 원점수 (높을수록 인기) */
  score: number
  /** 플랫폼명 */
  platformNames: string[]
  /** TMDB 메타 (JustWatch만 쓰면 나중에 TMDB 보완용) */
  tmdb?: TmdbWorkRow
}

const TOP_N = 20

/**
 * JustWatch 파트너 토큰이 있으면 JustWatch 호출, 없으면 TMDB 한국 인기로 상위 20 반환.
 * 반환 순서 = 인기 순 (1등이 첫 번째).
 */
export async function fetchPopularInKorea(): Promise<PopularItem[]> {
  const justWatchToken = process.env.JUSTWATCH_PARTNER_TOKEN

  if (justWatchToken) {
    try {
      const fromJustWatch = await fetchJustWatchPopular(justWatchToken)
      if (fromJustWatch.length > 0) return fromJustWatch
    } catch (e) {
      console.warn('JustWatch fetch failed, fallback to TMDB:', e)
    }
  }

  return fetchPopularViaTmdb()
}

/**
 * JustWatch API — 파트너 계약 후 토큰 발급 시 사용.
 * 문서: https://apis.justwatch.com/docs/
 */
async function fetchJustWatchPopular(_token: string): Promise<PopularItem[]> {
  // TODO: JustWatch Content Partner API 호출
  // country=KR, platform filter: netflix, tving, disneyplus, coupangplay, 상위 20
  // 응답을 PopularItem[] 형태로 변환
  return []
}

/**
 * TMDB 한국 인기 (넷플릭스·디즈니+ 등) 상위 20 — MVP 폴백.
 * 영화 10 + 시리즈 10 합쳐서 인기순으로 정렬 후 20개.
 */
async function fetchPopularViaTmdb(): Promise<PopularItem[]> {
  const rows = await fetchWorksInKorea(10, 10)
  const items: PopularItem[] = rows.slice(0, TOP_N).map((r, i) => ({
    title: r.title,
    title_en: r.title_en,
    score: TOP_N - i,
    platformNames: r.platform ?? [],
    tmdb: r,
  }))
  return items
}
