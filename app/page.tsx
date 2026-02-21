import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { WorkCard } from '@/components/WorkCard'

export const revalidate = 60

export default async function HomePage() {
  const supabase = createClient()

  const [
    { data: featured },
    { data: recent },
    { data: upcoming },
  ] = await Promise.all([
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
            <Link href="/schedule" className="hover:text-text">일정</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-content px-4 py-16 text-center">
        <h1 className="font-heading text-5xl font-bold uppercase tracking-wider text-text md:text-6xl">
          보기 전에 판단한다
        </h1>
        <p className="mt-4 text-lg text-text-muted">
          OTT 작품의 예고편, 리뷰, 평점을 한눈에 확인하세요.
        </p>
        <Link
          href="/works"
          className="mt-8 inline-block rounded-lg bg-accent px-6 py-3 font-medium text-white transition hover:opacity-90"
        >
          작품 보러 가기
        </Link>
      </section>

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
        © 옽싹 OTT 작품 판단 허브
      </footer>
    </main>
  )
}
