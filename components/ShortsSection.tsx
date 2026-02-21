'use client'

import { useState } from 'react'
import Image from 'next/image'
import { VideoModal } from './VideoModal'
import type { Video } from '@/types/database'

interface ShortsSectionProps {
  videos: Video[]
}

/** 쇼츠 세로 9:16, 3~6개, 클릭 시 모달 재생 */
export function ShortsSection({ videos }: ShortsSectionProps) {
  const [modalId, setModalId] = useState<string | null>(null)
  const list = videos.slice(0, 6)

  if (list.length === 0) return null

  return (
    <section className="mx-auto max-w-content px-4 py-8">
      <h2 className="mb-4 font-heading text-xl font-bold uppercase tracking-wide text-text">
        ⚡ 쇼츠
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {list.map((video) => {
          const thumb = video.thumbnail_url || `https://i.ytimg.com/vi/${video.youtube_id}/mqdefault.jpg`
          return (
            <button
              key={video.id}
              type="button"
              onClick={() => setModalId(video.youtube_id)}
              className="group flex flex-col overflow-hidden rounded-card bg-surface text-left transition hover:shadow-xl"
            >
              <div className="relative aspect-[9/16] w-full overflow-hidden bg-border">
                <Image
                  src={thumb}
                  alt={video.title}
                  fill
                  className="object-cover transition group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 16vw"
                />
                <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
                  ▶
                </span>
              </div>
              <p className="mt-2 line-clamp-2 px-1 text-xs text-text">{video.title}</p>
            </button>
          )
        })}
      </div>
      <VideoModal youtubeId={modalId} onClose={() => setModalId(null)} />
    </section>
  )
}
