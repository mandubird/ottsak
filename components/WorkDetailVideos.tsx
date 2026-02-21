'use client'

import { useState } from 'react'
import { VideoCard } from './VideoCard'
import type { Video } from '@/types/database'

const REVIEW_LIMIT = 5
type VideoFilter = 'all' | 'trailer' | 'shorts' | 'review'

const FILTERS: { key: VideoFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'trailer', label: '예고편' },
  { key: 'shorts', label: '쇼츠' },
  { key: 'review', label: '리뷰' },
]

interface WorkDetailVideosProps {
  videos: Video[]
}

export function WorkDetailVideos({ videos }: WorkDetailVideosProps) {
  const [filter, setFilter] = useState<VideoFilter>('all')

  const trailers = videos.filter((v) => v.video_type === 'trailer')
  const reviews = videos.filter((v) => v.video_type === 'review')
  const shorts = videos.filter((v) => v.video_type === 'shorts' || v.video_type === 'etc')

  const filtered =
    filter === 'all'
      ? videos
      : filter === 'trailer'
        ? trailers
        : filter === 'shorts'
          ? shorts
          : reviews

  if (videos.length === 0) {
    return (
      <section className="mx-auto max-w-content px-4 py-8">
        <p className="text-center text-text-muted">등록된 영상이 없습니다.</p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-content space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-2 font-heading text-xl font-bold uppercase tracking-wide text-text">
          영상
        </h2>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === key
                  ? 'bg-accent text-white'
                  : 'bg-surface text-text-muted hover:bg-border/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filter === 'all' && (
        <>
          {trailers.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-text-muted">공식 예고편</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {trailers.map((video) => (
                  <VideoCard key={video.id} video={video} showWork={false} />
                ))}
              </div>
            </div>
          )}
          {reviews.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-text-muted">유튜브 리뷰</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {reviews.slice(0, REVIEW_LIMIT).map((video) => (
                  <VideoCard key={video.id} video={video} showWork={false} />
                ))}
              </div>
            </div>
          )}
          {shorts.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-text-muted">쇼츠 · 기타</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {shorts.map((video) => (
                  <VideoCard key={video.id} video={video} showWork={false} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {filter !== 'all' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((video) => (
            <VideoCard key={video.id} video={video} showWork={false} />
          ))}
        </div>
      )}
    </section>
  )
}
