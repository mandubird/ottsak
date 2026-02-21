'use client'

import { VideoHub } from '@/components/VideoHub'
import type { VideoWithWork } from '@/types/database'

interface VideoHubClientProps {
  videos: VideoWithWork[]
}

export function VideoHubClient({ videos }: VideoHubClientProps) {
  const normalized = videos.map((v) => ({
    ...v,
    work: v.work ?? v.works ?? null,
  }))
  return (
    <section className="mx-auto max-w-content px-4 py-8">
      <h1 className="mb-6 font-heading text-3xl font-bold uppercase tracking-wide text-text">
        영상 허브
      </h1>
      <VideoHub videos={normalized} showWorkLink />
    </section>
  )
}
