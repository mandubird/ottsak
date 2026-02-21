import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CalendarView } from '@/components/CalendarView'
import type { Work } from '@/types/database'

export const revalidate = 60

export default async function SchedulePage() {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  const { data: upcoming, error } = await supabase
    .from('works')
    .select('*')
    .gte('release_date', today)
    .order('release_date', { ascending: true })

  if (error) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-content px-4 py-8">
          <p className="text-red-400">일정을 불러오는 중 오류가 발생했습니다.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-4">
          <Link href="/" className="font-heading text-2xl font-bold tracking-wide text-accent">
            옽싹
          </Link>
          <nav className="flex gap-6 text-sm text-text-muted">
            <Link href="/works" className="hover:text-text">작품</Link>
            <Link href="/videos" className="hover:text-text">영상</Link>
            <Link href="/schedule" className="text-text">일정</Link>
          </nav>
        </div>
      </header>

      <CalendarView upcomingWorks={(upcoming ?? []) as Work[]} />
    </main>
  )
}
