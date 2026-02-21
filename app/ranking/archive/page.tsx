import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 120

export default async function RankingArchivePage() {
  const supabase = createClient()

  const { data: weeks } = await supabase
    .from('weekly_rankings')
    .select('year, week')
    .order('year', { ascending: false })
    .order('week', { ascending: false })

  const seen = new Set<string>()
  const list: { year: number; week: number }[] = []
  for (const r of weeks ?? []) {
    const key = `${r.year}-${r.week}`
    if (!seen.has(key)) {
      seen.add(key)
      list.push({ year: r.year, week: r.week })
    }
  }

  const { data: months } = await supabase
    .from('monthly_rankings')
    .select('year, month')
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  const seenM = new Set<string>()
  const monthList: { year: number; month: number }[] = []
  for (const r of months ?? []) {
    const key = `${r.year}-${r.month}`
    if (!seenM.has(key)) {
      seenM.add(key)
      monthList.push({ year: r.year, month: r.month })
    }
  }

  const monthNames = ['', '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

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
          지난 인기 보기
        </h1>
        <p className="mt-2 text-text-muted">
          주간·월간 랭킹 아카이브
        </p>

        <div className="mt-8">
          <h2 className="mb-3 font-medium text-text">주간 랭킹</h2>
          <ul className="space-y-1">
            {list.slice(0, 20).map(({ year, week }) => (
              <li key={`${year}-${week}`}>
                <Link
                  href={`/ranking/${year}-week-${week}`}
                  className="text-accent hover:underline"
                >
                  {year}년 {week}주차
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10">
          <h2 className="mb-3 font-medium text-text">월간 랭킹</h2>
          <ul className="space-y-1">
            {monthList.slice(0, 12).map(({ year, month }) => (
              <li key={`${year}-${month}`}>
                <Link
                  href={`/ranking/${year}-${month}`}
                  className="text-accent hover:underline"
                >
                  {year}년 {monthNames[month]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
