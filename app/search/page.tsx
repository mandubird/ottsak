import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SearchForm } from './SearchForm'
import { WorkCard } from '@/components/WorkCard'
import type { Work } from '@/types/database'

export const revalidate = 60

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams
  const q = (params.q ?? '').trim()

  let works: Work[] = []
  if (q) {
    const supabase = createClient()
    const { data } = await supabase
      .from('works')
      .select('*')
      .or(`title.ilike.%${q}%,title_en.ilike.%${q}%,overview.ilike.%${q}%`)
      .order('created_at', { ascending: false })
      .limit(50)
    works = (data ?? []) as Work[]
  }

  return (
    <main className="min-h-screen pb-20 md:pb-0">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-4">
          <Link href="/" className="font-heading text-2xl font-bold tracking-wide text-accent">
            오싹
          </Link>
          <nav className="hidden gap-6 text-sm text-text-muted md:flex">
            <Link href="/search" className="text-text">검색</Link>
            <Link href="/works" className="hover:text-text">작품</Link>
            <Link href="/videos" className="hover:text-text">영상</Link>
            <Link href="/schedule" className="hover:text-text">일정</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-content px-4 py-8">
        <h1 className="mb-6 font-heading text-2xl font-bold uppercase tracking-wide text-text">
          작품 검색
        </h1>
        <SearchForm key={q} defaultValue={q} />
        {q && (
          <p className="mt-4 text-sm text-text-muted">
            &quot;{q}&quot; 검색 결과 {works.length}건
          </p>
        )}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {works.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
        {q && works.length === 0 && (
          <p className="py-12 text-center text-text-muted">검색 결과가 없습니다.</p>
        )}
      </div>
    </main>
  )
}
