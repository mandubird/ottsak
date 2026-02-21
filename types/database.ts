/**
 * Supabase DB 스키마 기반 TypeScript 타입 정의
 * 테이블: works, videos, pending_videos
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
