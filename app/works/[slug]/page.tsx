import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WorkHero } from '@/components/WorkHero'
import { VideoHub } from '@/components/VideoHub'
import type { Work, Video } from '@/types/database'

export const revalidate = 300

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getWork(slug: string) {
  const supabase = createClient()
  const { data: work, error } = await supabase
    .from('works')
    .select(`
      *,
      videos (
        id, work_id, youtube_id, title, video_type,
        thumbnail_url, view_count, channel_name, duration_sec
      )
    `)
    .eq('slug', slug)
    .single()

  if (error || !work) return null
  return work as Work & { videos: Video[] }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const work = await getWork(slug)
  if (!work) return { title: '작품을 찾을 수 없습니다' }
  const description = work.overview?.substring(0, 160) ?? undefined
  return {
    title: `${work.title} — 옽싹에서 미리 판단하기`,
    description,
    openGraph: {
      title: work.title,
      description: work.overview ?? undefined,
      images: work.poster_url ? [{ url: work.poster_url }] : undefined,
    },
  }
}

export default async function WorkDetailPage({ params }: PageProps) {
  const { slug } = await params
  const work = await getWork(slug)
  if (!work) notFound()

  const videos = work.videos ?? []
  const sortedVideos = [...videos].sort((a, b) => Number(b.view_count - a.view_count))

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-4">
          <a href="/" className="font-heading text-2xl font-bold tracking-wide text-accent">
            옽싹
          </a>
          <nav className="flex gap-6 text-sm text-text-muted">
            <a href="/works" className="hover:text-text">작품</a>
            <a href="/videos" className="hover:text-text">영상</a>
            <a href="/schedule" className="hover:text-text">일정</a>
          </nav>
        </div>
      </header>
      <WorkHero work={work} />
      <VideoHub videos={sortedVideos} showWorkLink={false} />
    </main>
  )
}
