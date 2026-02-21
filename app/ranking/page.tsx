import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
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

export default async function RankingPage() {
  const supabase = createClient()
  const now = new Date()
  const year = now.getFullYear()
  const week = getWeekNumber(now)

  const { data: rows } = await supabase
    .from('weekly_rankings')
    .select(`
      id, work_id, rank, score, week, year,
      works(id, slug, title, poster_url, type, release_date, platform)
    `)
    .eq('year', year)
    .eq('week', week)
    .order('rank', { ascending: true })

  const items = (rows ?? []).map((r: Record<string, unknown>) => ({
    rank: r.rank,
    score: r.score,
    work: r.works as Pick<Work, 'id' | 'slug' | 'title' | 'poster_url' | 'type' | 'release_date' | 'platform'> | null,
  }))

  return (
    <main className="min-h-screen pb-24 md:pb-0">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-4">
          <Link href="/" className="font-heading text-2xl font-bold tracking-wide text-accent">
            오싹
          </Link>
          <nav className="hidden gap-6 text-sm text-text-muted md:flex">
            <Link href="/ranking" className="text-accent">랭킹</Link>
            <Link href="/search" className="hover:text-text">검색</Link>
            <Link href="/works" className="hover:text-text">작품</Link>
            <Link href="/videos" className="hover:text-text">영상</Link>
            <Link href="/schedule" className="hover:text-text">일정</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-content px-4 py-8">
        <h1 className="font-heading text-3xl font-bold uppercase tracking-wide text-text">
          랭킹
        </h1>
        <p className="mt-2 text-text-muted">
          한국 OTT 통합 주간 인기 TOP10
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-lg bg-accent/20 px-3 py-1.5 text-sm font-medium text-accent">
            이번 주 {year}년 {week}주차
          </span>
          <Link
            href="/ranking/archive"
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text hover:bg-border/50"
          >
            지난 인기 보기
          </Link>
        </div>

        {items.length > 0 ? (
          <RankingWorkGrid items={items} showRank />
        ) : (
          <p className="mt-8 text-center text-text-muted">
            이번 주 랭킹이 아직 없습니다. 매주 일요일 23:59에 자동 집계됩니다.
          </p>
        )}
      </section>
    </main>
  )
}
