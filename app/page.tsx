import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { WorkCard } from '@/components/WorkCard'
import { RankingWorkGrid } from '@/components/RankingWorkGrid'
import type { Work } from '@/types/database'

export const revalidate = 60

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export default async function HomePage() {
  const supabase = createClient()
  const now = new Date()
  const year = now.getFullYear()
  const week = getWeekNumber(now)

  const [
    { data: weeklyRows },
    { data: featured },
    { data: recent },
    { data: upcoming },
  ] = await Promise.all([
    supabase
      .from('weekly_rankings')
      .select(`
        id, work_id, rank, score, week, year,
        works(id, slug, title, poster_url, type, release_date, platform)
      `)
      .eq('year', year)
      .eq('week', week)
      .order('rank', { ascending: true })
      .limit(10),
    supabase
      .from('works')
      .select('*')
      .eq('is_featured', true)
      .limit(6),
    supabase
      .from('works')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('works')
      .select('*')
      .gte('release_date', new Date().toISOString().split('T')[0])
      .order('release_date', { ascending: true })
      .limit(4),
  ])

  const top10Items = (weeklyRows ?? []).map((r: Record<string, unknown>) => ({
    rank: Number(r.rank),
    score: Number(r.score),
    work: r.works as Pick<Work, 'id' | 'slug' | 'title' | 'poster_url' | 'type' | 'release_date' | 'platform'> | null,
  }))

  return (
    <main className="min-h-screen pb-20 md:pb-0">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-4">
          <Link href="/" className="font-heading text-2xl font-bold tracking-wide text-accent">
            오싹
          </Link>
          <nav className="hidden gap-6 text-sm text-text-muted md:flex">
            <Link href="/ranking" className="hover:text-text">랭킹</Link>
            <Link href="/search" className="hover:text-text">검색</Link>
            <Link href="/works" className="hover:text-text">작품</Link>
            <Link href="/videos" className="hover:text-text">영상</Link>
            <Link href="/schedule" className="hover:text-text">일정</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-content px-4 py-16 text-center">
        <h1 className="font-heading text-5xl font-bold uppercase tracking-wider text-text md:text-6xl">
          한국 OTT 주간 인기 랭킹
        </h1>
        <p className="mt-4 text-lg text-text-muted">
          이번주 TOP10 · 지난주 비교 · 영상 중심 작품 허브
        </p>
        <Link
          href="/ranking"
          className="mt-8 inline-block rounded-lg bg-accent px-6 py-3 font-medium text-white transition hover:opacity-90"
        >
          랭킹 보기
        </Link>
      </section>

      {top10Items.length > 0 && (
        <section className="mx-auto max-w-content px-4 py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold uppercase tracking-wide text-text">
              이번주 TOP10
            </h2>
            <Link href="/ranking" className="text-sm text-accent hover:underline">
              전체 랭킹
            </Link>
          </div>
          <RankingWorkGrid items={top10Items} showRank />
        </section>
      )}

      {featured && featured.length > 0 && (
        <section className="mx-auto max-w-content px-4 py-12">
          <h2 className="mb-6 font-heading text-2xl font-bold uppercase tracking-wide text-text">
            지금 화제 작품
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {featured.map((work) => (
              <WorkCard key={work.id} work={work as import('@/types/database').Work} />
            ))}
          </div>
        </section>
      )}

      {recent && recent.length > 0 && (
        <section className="mx-auto max-w-content px-4 py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold uppercase tracking-wide text-text">
              최근 등록 작품
            </h2>
            <Link href="/works" className="text-sm text-accent hover:underline">
              전체 보기
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            {recent.map((work) => (
              <WorkCard key={work.id} work={work as import('@/types/database').Work} />
            ))}
          </div>
        </section>
      )}

      {upcoming && upcoming.length > 0 && (
        <section className="mx-auto max-w-content px-4 py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold uppercase tracking-wide text-text">
              공개 예정
            </h2>
            <Link href="/schedule" className="text-sm text-accent hover:underline">
              일정 보기
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {upcoming.map((work) => (
              <WorkCard key={work.id} work={work as import('@/types/database').Work} />
            ))}
          </div>
        </section>
      )}

      <footer className="mt-16 border-t border-border py-8 text-center text-sm text-text-muted">
        © 오싹 한국 OTT 주간 인기 랭킹
      </footer>
    </main>
  )
}
