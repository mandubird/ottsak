'use client'

import { useState } from 'react'
import Image from 'next/image'
import { VideoModal } from './VideoModal'
import type { Video } from '@/types/database'

function formatViewCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function formatDate(s: string | null): string {
  if (!s) return ''
  try {
    return new Date(s).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

interface ReactionSectionProps {
  videos: Video[]
}

/** 리뷰/해설/리액션/분석 — 가로 스크롤 카드, 클릭 시 모달 iframe */
export function ReactionSection({ videos }: ReactionSectionProps) {
  const [modalId, setModalId] = useState<string | null>(null)
  const list = videos.slice(0, 6)

  if (list.length === 0) return null

  return (
    <section className="mx-auto max-w-content px-4 py-8">
      <h2 className="mb-4 font-heading text-xl font-bold uppercase tracking-wide text-text">
        🔥 유튜브 반응
      </h2>
      <p className="mb-4 text-sm text-text-muted">
        리뷰 · 해설 · 리액션 · 분석 영상
      </p>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin md:gap-6">
        {list.map((video) => {
          const thumb = video.thumbnail_url || `https://i.ytimg.com/vi/${video.youtube_id}/mqdefault.jpg`
          return (
            <button
              key={video.id}
              type="button"
              onClick={() => setModalId(video.youtube_id)}
              className="group flex w-[280px] shrink-0 flex-col overflow-hidden rounded-card bg-surface text-left transition hover:shadow-xl"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-border">
                <Image
                  src={thumb}
                  alt={video.title}
                  fill
                  className="object-cover transition group-hover:scale-105"
                  sizes="280px"
                />
                <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
                  ▶ 재생
                </span>
              </div>
              <div className="p-3">
                <p className="line-clamp-2 font-medium text-text">{video.title}</p>
                <p className="mt-1 text-xs text-text-muted">
                  조회 {formatViewCount(video.view_count)}
                  {video.published_at && ` · ${formatDate(video.published_at)}`}
                </p>
              </div>
            </button>
          )
        })}
      </div>
      <VideoModal youtubeId={modalId} onClose={() => setModalId(null)} />
    </section>
  )
}
