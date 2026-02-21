import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RankingWorkGrid } from '@/components/RankingWorkGrid'
import type { Work } from '@/types/database'

export const revalidate = 120

const MONTH_NAMES: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
}

function parseSlug(slug: string): { type: 'week'; year: number; week: number } | { type: 'month'; year: number; month: number } | null {
  const weekMatch = slug.match(/^(\d{4})-week-(\d{1,2})$/)
  if (weekMatch) {
    const year = parseInt(weekMatch[1], 10)
    const week = parseInt(weekMatch[2], 10)
    if (week >= 1 && week <= 53) return { type: 'week', year, week }
  }
  const monthMatch = slug.match(/^(\d{4})-(\d{1,2})$/)
  if (monthMatch) {
    const year = parseInt(monthMatch[1], 10)
    const month = parseInt(monthMatch[2], 10)
    if (month >= 1 && month <= 12) return { type: 'month', year, month }
  }
  const monthNameMatch = slug.match(/^(\d{4})-(.+)$/)
  if (monthNameMatch) {
    const year = parseInt(monthNameMatch[1], 10)
    const monthKey = monthNameMatch[2].toLowerCase().replace(/\s/g, '')
    const month = MONTH_NAMES[monthKey]
    if (month) return { type: 'month', year, month }
  }
  return null
}

export default async function RankingSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const parsed = parseSlug(slug)
  if (!parsed) notFound()

  const supabase = createClient()

  if (parsed.type === 'week') {
    const { data: rows } = await supabase
      .from('weekly_rankings')
      .select(`
        id, work_id, rank, score, week, year,
        works(id, slug, title, poster_url, type, release_date, platform)
      `)
      .eq('year', parsed.year)
      .eq('week', parsed.week)
      .order('rank', { ascending: true })

    if (!rows?.length) notFound()

    const items = rows.map((r: Record<string, unknown>) => ({
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
          <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-text">
            {parsed.year}년 {parsed.week}주차 랭킹
          </h1>
          <p className="mt-2 text-text-muted">주간 인기 TOP10</p>
          <Link href="/ranking/archive" className="mt-4 inline-block text-sm text-accent hover:underline">
            ← 지난 인기 목록
          </Link>
          <RankingWorkGrid items={items} showRank />
        </section>
      </main>
    )
  }

  const { data: rows } = await supabase
    .from('monthly_rankings')
    .select(`
      id, work_id, rank, score, month, year,
      works(id, slug, title, poster_url, type, release_date, platform)
    `)
    .eq('year', parsed.year)
    .eq('month', parsed.month)
    .order('rank', { ascending: true })

  if (!rows?.length) notFound()

  const monthNames = ['', '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
  const items = rows.map((r: Record<string, unknown>) => ({
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
        <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-text">
          {parsed.year}년 {monthNames[parsed.month]} 랭킹
        </h1>
        <p className="mt-2 text-text-muted">월간 인기 TOP10</p>
        <Link href="/ranking/archive" className="mt-4 inline-block text-sm text-accent hover:underline">
          ← 지난 인기 목록
        </Link>
        <RankingWorkGrid items={items} showRank />
      </section>
    </main>
  )
}
