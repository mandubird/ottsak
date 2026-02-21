import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FilterBar } from '@/components/FilterBar'
import { WorkCard } from '@/components/WorkCard'
import type { Work } from '@/types/database'

export const revalidate = 60

const LIMIT = 20

interface PageProps {
  searchParams: Promise<{ genre?: string; type?: string; sort?: string; page?: string }>
}

export default async function WorksPage({ searchParams }: PageProps) {
  const params = await searchParams
  const genre = params.genre ?? ''
  const type = (params.type === 'movie' || params.type === 'series') ? params.type : null
  const sort = params.sort ?? 'latest'
  const page = Math.max(1, parseInt(params.page ?? '1', 10))

  const supabase = createClient()

  let query = supabase.from('works').select('*', { count: 'exact' })

  if (genre) query = query.contains('genre', [genre])
  if (type) query = query.eq('type', type)

  if (sort === 'latest') {
    query = query.order('created_at', { ascending: false })
  } else if (sort === 'popular') {
    query = query.order('view_count', { ascending: false })
  } else if (sort === 'rating') {
    query = query.order('rating', { ascending: false, nullsFirst: false })
  }

  const from = (page - 1) * LIMIT
  const to = from + LIMIT - 1
  const { data: works, count, error } = await query.range(from, to)

  const total = count ?? 0
  const totalPages = Math.ceil(total / LIMIT)

  if (error) {
    return (
      <main className="min-h-screen pb-20 md:pb-0">
        <div className="mx-auto max-w-content px-4 py-8">
          <p className="text-red-400">작품 목록을 불러오는 중 오류가 발생했습니다.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pb-20 md:pb-0">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-4">
          <Link href="/" className="font-heading text-2xl font-bold tracking-wide text-accent">
            옽싹
          </Link>
          <nav className="hidden gap-6 text-sm text-text-muted md:flex">
            <Link href="/search" className="hover:text-text">검색</Link>
            <Link href="/works" className="text-text">작품</Link>
            <Link href="/videos" className="hover:text-text">영상</Link>
            <Link href="/schedule" className="hover:text-text">일정</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-content px-4 py-8">
        <h1 className="mb-6 font-heading text-3xl font-bold uppercase tracking-wide text-text">
          작품 목록
        </h1>
        <FilterBar />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {(works ?? []).map((work) => (
            <WorkCard key={work.id} work={work as Work} />
          ))}
        </div>
        {totalPages > 1 && (
          <nav className="mt-8 flex justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/works?${new URLSearchParams({
                  ...(genre && { genre }),
                  ...(type && { type }),
                  sort,
                  page: String(page - 1),
                }).toString()}`}
                className="rounded border border-border bg-surface px-4 py-2 text-sm text-text hover:bg-border"
              >
                이전
              </Link>
            )}
            <span className="flex items-center px-4 text-text-muted">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/works?${new URLSearchParams({
                  ...(genre && { genre }),
                  ...(type && { type }),
                  sort,
                  page: String(page + 1),
                }).toString()}`}
                className="rounded border border-border bg-surface px-4 py-2 text-sm text-text hover:bg-border"
              >
                다음
              </Link>
            )}
          </nav>
        )}
      </div>
    </main>
  )
}
