/**
 * TMDB API v3 - 트렌딩/인기 영화·드라마 수집 후 works 형식으로 반환
 */

const BASE = 'https://api.themoviedb.org/3'
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

const API_KEY = process.env.TMDB_API_KEY

export type WorkType = 'movie' | 'series'

export interface TmdbWorkRow {
  slug: string
  title: string
  title_en: string | null
  type: WorkType
  genre: string[]
  platform: string[] | null
  release_date: string | null
  rating: number | null
  poster_url: string | null
  backdrop_url: string | null
  overview: string | null
  tmdb_id: number
}

function slugify(text: string, tmdbId: number): string {
  const s = text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  const base = s || `work-${tmdbId}`
  return `${base}-${tmdbId}`
}

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  if (!API_KEY) throw new Error('TMDB_API_KEY가 설정되지 않았습니다.')
  const q = new URLSearchParams({ api_key: API_KEY, language: 'ko-KR', ...params })
  const res = await fetch(`${BASE}${path}?${q}`)
  if (!res.ok) throw new Error(`TMDB API ${res.status}: ${await res.text()}`)
  return res.json()
}

/** 영화 상세 → works 행 */
async function movieToRow(movie: Record<string, unknown>): Promise<TmdbWorkRow> {
  const id = movie.id as number
  const title = (movie.title as string) || ''
  const titleEn = (movie.original_title as string) || null
  const genres = (movie.genres as { id: number; name: string }[]) || []
  const release = (movie.release_date as string) || null
  const vote = (movie.vote_average as number) ?? null
  const poster = movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : null
  const backdrop = movie.backdrop_path ? `${IMAGE_BASE}${movie.backdrop_path}` : null
  const overview = (movie.overview as string) || null

  return {
    slug: slugify(titleEn || title, id),
    title: title,
    title_en: titleEn || title || null,
    type: 'movie',
    genre: genres.map((g) => g.name),
    platform: null,
    release_date: release?.slice(0, 10) || null,
    rating: vote != null ? Math.round(vote * 10) / 10 : null,
    poster_url: poster,
    backdrop_url: backdrop,
    overview: overview,
    tmdb_id: id,
  }
}

/** TV 상세 → works 행 */
async function tvToRow(tv: Record<string, unknown>): Promise<TmdbWorkRow> {
  const id = tv.id as number
  const title = (tv.name as string) || ''
  const titleEn = (tv.original_name as string) || null
  const genres = (tv.genres as { id: number; name: string }[]) || []
  const release = (tv.first_air_date as string) || null
  const vote = (tv.vote_average as number) ?? null
  const poster = tv.poster_path ? `${IMAGE_BASE}${tv.poster_path}` : null
  const backdrop = tv.backdrop_path ? `${IMAGE_BASE}${tv.backdrop_path}` : null
  const overview = (tv.overview as string) || null

  return {
    slug: slugify(titleEn || title, id),
    title: title,
    title_en: titleEn || title || null,
    type: 'series',
    genre: genres.map((g) => g.name),
    platform: null,
    release_date: release?.slice(0, 10) || null,
    rating: vote != null ? Math.round(vote * 10) / 10 : null,
    poster_url: poster,
    backdrop_url: backdrop,
    overview: overview,
    tmdb_id: id,
  }
}

/** 트렌딩 영화 N개 수집 (상세 포함) */
export async function fetchTrendingMovies(limit: number = 15): Promise<TmdbWorkRow[]> {
  const data = await get<{ results: { id: number }[] }>('/trending/movie/week')
  const list = (data.results || []).slice(0, limit)
  const rows: TmdbWorkRow[] = []
  for (const item of list) {
    try {
      const detail = await get<Record<string, unknown>>(`/movie/${item.id}`)
      rows.push(await movieToRow(detail))
      await new Promise((r) => setTimeout(r, 120))
    } catch (e) {
      console.warn(`TMDB movie ${item.id} skip:`, e)
    }
  }
  return rows
}

/** 트렌딩 TV N개 수집 (상세 포함) */
export async function fetchTrendingTv(limit: number = 15): Promise<TmdbWorkRow[]> {
  const data = await get<{ results: { id: number }[] }>('/trending/tv/week')
  const list = (data.results || []).slice(0, limit)
  const rows: TmdbWorkRow[] = []
  for (const item of list) {
    try {
      const detail = await get<Record<string, unknown>>(`/tv/${item.id}`)
      rows.push(await tvToRow(detail))
      await new Promise((r) => setTimeout(r, 120))
    } catch (e) {
      console.warn(`TMDB tv ${item.id} skip:`, e)
    }
  }
  return rows
}

/** 영화 + TV 트렌딩 수집 (한 번에 호출용) */
export async function fetchTrendingWorks(
  movieLimit: number = 10,
  tvLimit: number = 10
): Promise<TmdbWorkRow[]> {
  const [movies, tvs] = await Promise.all([
    fetchTrendingMovies(movieLimit),
    fetchTrendingTv(tvLimit),
  ])
  return [...movies, ...tvs]
}
