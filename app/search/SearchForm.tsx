'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

interface SearchFormProps {
  defaultValue?: string
}

export function SearchForm({ defaultValue = '' }: SearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [q, setQ] = useState(defaultValue)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const term = q.trim()
      if (!term) {
        router.push('/search')
        return
      }
      const next = new URLSearchParams(searchParams.toString())
      next.set('q', term)
      router.push(`/search?${next.toString()}`)
    },
    [q, router, searchParams]
  )

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="작품명으로 검색"
        className="flex-1 rounded-lg border border-border bg-surface px-4 py-3 text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
        aria-label="작품 검색"
      />
      <button
        type="submit"
        className="rounded-lg bg-accent px-6 py-3 font-medium text-white transition hover:opacity-90"
      >
        검색
      </button>
    </form>
  )
}
