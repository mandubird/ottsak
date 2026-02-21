'use client'

import { VideoCard } from './VideoCard'
import type { Video } from '@/types/database'

const REVIEW_LIMIT = 3

interface WorkDetailVideosProps {
  videos: Video[]
}

export function WorkDetailVideos({ videos }: WorkDetailVideosProps) {
  const trailers = videos.filter((v) => v.video_type === 'trailer')
  const reviews = videos.filter((v) => v.video_type === 'review').slice(0, REVIEW_LIMIT)

  if (trailers.length === 0 && reviews.length === 0) {
    return (
      <section className="mx-auto max-w-content px-4 py-8">
        <p className="text-center text-text-muted">등록된 영상이 없습니다.</p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-content space-y-10 px-4 py-8">
      {trailers.length > 0 && (
        <div>
          <h2 className="mb-4 font-heading text-xl font-bold uppercase tracking-wide text-text">
            공식 예고편
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trailers.map((video) => (
              <VideoCard key={video.id} video={video} showWork={false} />
            ))}
          </div>
        </div>
      )}

      {reviews.length > 0 && (
        <div>
          <h2 className="mb-4 font-heading text-xl font-bold uppercase tracking-wide text-text">
            유튜브 리뷰
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((video) => (
              <VideoCard key={video.id} video={video} showWork={false} />
            ))}
          </div>
        </div>
      )}

      {videos.some((v) => v.video_type === 'shorts' || v.video_type === 'etc') && (
        <div>
          <h2 className="mb-4 font-heading text-xl font-bold uppercase tracking-wide text-text">
            쇼츠 · 기타
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {videos
              .filter((v) => v.video_type === 'shorts' || v.video_type === 'etc')
              .map((video) => (
                <VideoCard key={video.id} video={video} showWork={false} />
              ))}
          </div>
        </div>
      )}
    </section>
  )
}
