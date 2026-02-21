import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WorkHero } from '@/components/WorkHero'
import { WorkDetailSections } from '@/components/WorkDetailSections'
import { WorkMetaBox } from '@/components/WorkMetaBox'
import { WorkManualVideos } from '@/components/WorkManualVideos'
import { WorkDetailVideos } from '@/components/WorkDetailVideos'
import { WatchPlatformButtons } from '@/components/WatchPlatformButtons'
import { ReactionSummary } from '@/components/ReactionSummary'
import { RevenueSection } from '@/components/RevenueSection'
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
  const manualIds = work.manual_video_ids ?? []

  return (
    <main className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-10 border-b border-border bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-4">
          <a href="/" className="font-heading text-2xl font-bold tracking-wide text-accent">
            옽싹
          </a>
          <nav className="hidden gap-6 text-sm text-text-muted md:flex">
            <a href="/search" className="hover:text-text">검색</a>
            <a href="/works" className="hover:text-text">작품</a>
            <a href="/videos" className="hover:text-text">영상</a>
            <a href="/schedule" className="hover:text-text">일정</a>
          </nav>
        </div>
      </header>
      <WorkHero work={work} />
      {/* [작품 제목] [한 줄 요약] */}
      <WorkDetailSections work={work} />
      {/* [메타 정보 박스] */}
      <section className="mx-auto max-w-content px-4 pb-6">
        <WorkMetaBox work={work} />
      </section>
      {/* [영상 (예고편/리뷰)] — 수동 등록 + 자동 수집 */}
      <section className="mx-auto max-w-content space-y-10 px-4 py-6">
        {manualIds.length > 0 && <WorkManualVideos youtubeIds={manualIds} />}
        <WorkDetailVideos videos={sortedVideos} />
      </section>
      {/* [시청 플랫폼 버튼] 어디서 볼까, 플랫폼별 컬러 */}
      <WatchPlatformButtons work={work} />
      {/* [반응/리뷰 요약] placeholder */}
      <ReactionSummary work={work} />
      {/* [수익 영역] 공식 굿즈 + 제휴 링크 */}
      <RevenueSection work={work} />
    </main>
  )
}
