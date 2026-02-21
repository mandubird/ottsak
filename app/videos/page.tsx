import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { VideoHubClient } from './VideoHubClient'
import type { VideoWithWork } from '@/types/database'

export const revalidate = 60

export default async function VideosPage() {
  const supabase = createClient()
  const { data: videos, error } = await supabase
    .from('videos')
    .select(`
      *,
      works (slug, title, poster_url)
    `)
    .order('view_count', { ascending: false })
    .limit(50)

  if (error) {
    return (
      <main className="min-h-screen pb-20 md:pb-0">
        <div className="mx-auto max-w-content px-4 py-8">
          <p className="text-red-400">영상 목록을 불러오는 중 오류가 발생했습니다.</p>
        </div>
      </main>
    )
  }

  const list = (videos ?? []).map((v) => ({
    ...v,
    work: (v as { works?: unknown }).works ?? null,
  })) as VideoWithWork[]

  return (
    <main className="min-h-screen pb-20 md:pb-0">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-4">
          <Link href="/" className="font-heading text-2xl font-bold tracking-wide text-accent">
            오싹
          </Link>
          <nav className="hidden gap-6 text-sm text-text-muted md:flex">
            <Link href="/search" className="hover:text-text">검색</Link>
            <Link href="/works" className="hover:text-text">작품</Link>
            <Link href="/videos" className="text-text">영상</Link>
            <Link href="/schedule" className="hover:text-text">일정</Link>
          </nav>
        </div>
      </header>

      <VideoHubClient videos={list} />
    </main>
  )
}
