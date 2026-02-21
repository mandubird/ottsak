'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Video, VideoWithWork } from '@/types/database'

const VIDEO_TYPE_LABEL: Record<string, string> = {
  trailer: '예고편',
  shorts: '쇼츠',
  review: '리뷰',
  etc: '기타',
}

function formatViewCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function formatDuration(sec: number | null): string {
  if (sec == null) return ''
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface VideoCardProps {
  video: Video | VideoWithWork
  showWork?: boolean
}

export function VideoCard({ video, showWork = false }: VideoCardProps) {
  const thumbUrl = video.thumbnail_url || `https://i.ytimg.com/vi/${video.youtube_id}/mqdefault.jpg`
  const work = 'work' in video ? video.work : ('works' in video ? video.works : null)

  return (
    <div className="group overflow-hidden rounded-card bg-surface transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30">
      <a
        href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="relative aspect-video overflow-hidden bg-border">
          <Image
            src={thumbUrl}
            alt={video.title}
            fill
            className="object-cover transition duration-200 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
          <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 font-mono text-xs text-white">
            {formatDuration(video.duration_sec)}
          </span>
          <span className="absolute left-1 top-1 rounded bg-accent/90 px-1.5 py-0.5 text-xs font-medium text-white">
            {VIDEO_TYPE_LABEL[video.video_type] || video.video_type}
          </span>
        </div>
      </a>
      <div className="p-3">
        <a
          href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="line-clamp-2 font-medium text-text hover:text-accent"
        >
          {video.title}
        </a>
        {video.channel_name && (
          <p className="mt-0.5 text-sm text-text-muted">{video.channel_name}</p>
        )}
        <p className="text-xs text-text-muted">
          조회수 {formatViewCount(video.view_count)}
        </p>
        {showWork && work && (
          <Link
            href={`/works/${work.slug}`}
            className="mt-2 inline-block text-sm text-accent2 hover:underline"
          >
            {work.title}
          </Link>
        )}
      </div>
    </div>
  )
}
