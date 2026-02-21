'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const GENRES = [
  { value: '', label: '전체' },
  { value: '액션', label: '액션' },
  { value: '드라마', label: '드라마' },
  { value: '코미디', label: '코미디' },
  { value: 'SF', label: 'SF' },
  { value: '로맨스', label: '로맨스' },
  { value: '스릴러', label: '스릴러' },
  { value: '공포', label: '공포' },
  { value: '다큐', label: '다큐' },
]

const TYPES = [
  { value: '', label: '전체' },
  { value: 'movie', label: '영화' },
  { value: 'series', label: '시리즈' },
]

const SORTS = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'rating', label: '평점순' },
]

export function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const genre = searchParams.get('genre') ?? ''
  const type = searchParams.get('type') ?? ''
  const sort = searchParams.get('sort') ?? 'latest'

  function apply(field: string, value: string) {
    const next = new URLSearchParams(searchParams.toString())
    if (value) next.set(field, value)
    else next.delete(field)
    next.delete('page')
    router.push(`/works?${next.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-card border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-muted">장르</span>
        <select
          value={genre}
          onChange={(e) => apply('genre', e.target.value)}
          className="rounded border border-border bg-bg px-3 py-1.5 text-sm text-text focus:border-accent focus:outline-none"
        >
          {GENRES.map((g) => (
            <option key={g.value || 'all'} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-muted">타입</span>
        <select
          value={type}
          onChange={(e) => apply('type', e.target.value)}
          className="rounded border border-border bg-bg px-3 py-1.5 text-sm text-text focus:border-accent focus:outline-none"
        >
          {TYPES.map((t) => (
            <option key={t.value || 'all'} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-muted">정렬</span>
        <select
          value={sort}
          onChange={(e) => apply('sort', e.target.value)}
          className="rounded border border-border bg-bg px-3 py-1.5 text-sm text-text focus:border-accent focus:outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
