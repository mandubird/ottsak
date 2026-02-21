'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Work } from '@/types/database'

interface RankingItem {
  rank: number
  score: number
  work: Pick<Work, 'id' | 'slug' | 'title' | 'poster_url' | 'type' | 'release_date' | 'platform'> | null
}

interface RankingWorkGridProps {
  items: RankingItem[]
  showRank?: boolean
}

export function RankingWorkGrid({ items, showRank = true }: RankingWorkGridProps) {
  return (
    <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item) => {
        const w = item.work
        if (!w) return null
        return (
          <li key={w.id}>
            <Link
              href={`/works/${w.slug}`}
              className="group block overflow-hidden rounded-card bg-surface transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30"
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-border">
                {showRank && (
                  <span className="absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                    {item.rank}
                  </span>
                )}
                {w.poster_url ? (
                  <Image
                    src={w.poster_url}
                    alt={w.title}
                    fill
                    className="object-cover transition duration-200 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 20vw"
                    unoptimized={w.poster_url.startsWith('/')}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-text-muted text-sm">
                    No poster
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="truncate font-medium text-text" title={w.title}>
                  {w.title}
                </p>
                {w.platform && w.platform.length > 0 && (
                  <p className="mt-0.5 truncate text-xs text-text-muted">
                    {w.platform.join(', ')}
                  </p>
                )}
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
