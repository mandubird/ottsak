import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WorkHero } from '@/components/WorkHero'
import { TrailerSection } from '@/components/TrailerSection'
import { ReactionSection } from '@/components/ReactionSection'
import { ShortsSection } from '@/components/ShortsSection'
import { SpoilerSection } from '@/components/SpoilerSection'
import { GoodsSection } from '@/components/GoodsSection'
import { WatchPlatformButtons } from '@/components/WatchPlatformButtons'
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
        thumbnail_url, view_count, channel_name, duration_sec, published_at
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
    title: `${work.title} — 오싹`,
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
  const trailers = videos.filter((v) => v.video_type === 'trailer')
  const reactions = videos.filter((v) => v.video_type === 'review' || v.video_type === 'etc')
  const shorts = videos.filter((v) => v.video_type === 'shorts' || (v.duration_sec != null && v.duration_sec <= 60))

  const bestTrailer =
    trailers.length > 0
      ? trailers.reduce((a, b) => (Number(a.view_count) >= Number(b.view_count) ? a : b))
      : null

  const manualTrailerId = work.manual_video_ids?.[0] ?? null

  return (
    <main className="min-h-screen pb-24 md:pb-0">
      <header className="sticky top-0 z-10 border-b border-border bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-4">
          <a href="/" className="font-heading text-2xl font-bold tracking-wide text-accent">
            오싹
          </a>
          <nav className="hidden gap-6 text-sm text-text-muted md:flex">
            <a href="/ranking" className="hover:text-text">랭킹</a>
            <a href="/search" className="hover:text-text">검색</a>
            <a href="/works" className="hover:text-text">작품</a>
            <a href="/videos" className="hover:text-text">영상</a>
            <a href="/schedule" className="hover:text-text">일정</a>
          </nav>
        </div>
      </header>

      <WorkHero work={work} />
      <WatchPlatformButtons work={work} />

      <TrailerSection
        trailerVideo={bestTrailer}
        manualTrailerId={manualTrailerId}
      />

      <ReactionSection videos={[...reactions].sort((a, b) => Number(b.view_count) - Number(a.view_count))} />

      <ShortsSection videos={shorts} />

      <SpoilerSection work={work} />

      <GoodsSection work={work} />
    </main>
  )
}
