'use client'

import { useState } from 'react'
import { VideoCard } from './VideoCard'
import type { Video, VideoWithWork } from '@/types/database'

const TABS = [
  { value: 'all', label: '전체' },
  { value: 'trailer', label: '예고편' },
  { value: 'shorts', label: '쇼츠' },
  { value: 'review', label: '리뷰' },
] as const

interface VideoHubProps {
  videos: (Video | VideoWithWork)[]
  showWorkLink?: boolean
}

export function VideoHub({ videos, showWorkLink = false }: VideoHubProps) {
  const [activeTab, setActiveTab] = useState<string>('all')

  const filtered =
    activeTab === 'all'
      ? videos
      : videos.filter((v) => v.video_type === activeTab)

  return (
    <section className="mx-auto max-w-content px-4 py-8">
      {!showWorkLink && (
        <h2 className="mb-4 font-heading text-2xl font-bold uppercase tracking-wide text-text">
          영상
        </h2>
      )}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.value
                ? 'bg-accent text-white'
                : 'bg-surface text-text-muted hover:bg-border hover:text-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-text-muted">해당하는 영상이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((video) => (
            <VideoCard key={video.id} video={video} showWork={showWorkLink} />
          ))}
        </div>
      )}
    </section>
  )
}
