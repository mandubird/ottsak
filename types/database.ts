/**
 * Supabase DB 스키마 기반 TypeScript 타입 정의
 * works, videos, pending_videos, platforms, work_platforms, weekly_rankings, monthly_rankings
 */

export type WorkType = 'movie' | 'series'
export type VideoType = 'trailer' | 'shorts' | 'review' | 'etc'

export interface Work {
  id: string
  slug: string
  title: string
  title_en: string | null
  type: WorkType
  genre: string[] | null
  platform: string[] | null
  release_date: string | null
  end_date: string | null
  manual_video_ids: string[] | null
  rating: number | null
  poster_url: string | null
  backdrop_url: string | null
  overview: string | null
  tmdb_id: number | null
  view_count: number
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  work_id: string
  youtube_id: string
  title: string
  video_type: VideoType
  thumbnail_url: string | null
  channel_name: string | null
  view_count: number
  duration_sec: number | null
  match_score: number | null
  published_at: string | null
  created_at: string
}

export interface PendingVideo {
  id: string
  youtube_id: string
  title: string | null
  guessed_work_title: string | null
  match_score: number | null
  raw_data: Record<string, unknown> | null
  reviewed: boolean
  created_at: string
}

/** works + videos 조인 결과 (작품 상세용) */
export interface WorkWithVideos extends Work {
  videos: Video[]
}

/** videos + works 조인 결과 (영상 허브용) */
export interface VideoWithWork extends Video {
  work?: Pick<Work, 'slug' | 'title' | 'poster_url'> | null
  works?: Pick<Work, 'slug' | 'title' | 'poster_url'> | null
}

/** Supabase 테이블 타입 (insert 시 일부 필드 생략 가능) */
export interface WorkInsert {
  slug: string
  title: string
  title_en?: string | null
  type: WorkType
  genre?: string[] | null
  platform?: string[] | null
  release_date?: string | null
  end_date?: string | null
  manual_video_ids?: string[] | null
  rating?: number | null
  poster_url?: string | null
  backdrop_url?: string | null
  overview?: string | null
  tmdb_id?: number | null
  view_count?: number
  is_featured?: boolean
}

export interface VideoInsert {
  work_id: string
  youtube_id: string
  title: string
  video_type?: VideoType
  thumbnail_url?: string | null
  channel_name?: string | null
  view_count?: number
  duration_sec?: number | null
  match_score?: number | null
  published_at?: string | null
}

/** platforms (플랫폼 마스터) */
export interface Platform {
  id: string
  name: string
}

/** work_platforms (작품–플랫폼 N:M) */
export interface WorkPlatform {
  work_id: string
  platform_id: string
}

/** weekly_rankings (주간 스냅샷) */
export interface WeeklyRanking {
  id: string
  work_id: string
  rank: number
  score: number
  week: number
  year: number
  created_at: string
}

/** monthly_rankings (월간 집계) */
export interface MonthlyRanking {
  id: string
  work_id: string
  rank: number
  score: number
  month: number
  year: number
}

/** 주간 랭킹 + 작품 정보 (카드용) */
export interface WeeklyRankingWithWork extends WeeklyRanking {
  work: Pick<Work, 'id' | 'slug' | 'title' | 'poster_url' | 'type' | 'release_date'> | null
}

/** 월간 랭킹 + 작품 정보 */
export interface MonthlyRankingWithWork extends MonthlyRanking {
  work: Pick<Work, 'id' | 'slug' | 'title' | 'poster_url' | 'type' | 'release_date'> | null
}
