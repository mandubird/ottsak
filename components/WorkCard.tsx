'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Work } from '@/types/database'

interface WorkCardProps {
  work: Work
}

const PLATFORM_NAMES: Record<string, string> = {
  'Netflix': '넷플릭스',
  'Disney+': '디즈니+',
  'wavve': '웨이브',
  'Watcha': '왓챠',
  'Coupang Play': '쿠팡플레이',
  'TVING': '티빙',
}

export function WorkCard({ work }: WorkCardProps) {
  const posterUrl = work.poster_url
  const rating = work.rating != null ? work.rating.toFixed(1) : '-'

  return (
    <Link
      href={`/works/${work.slug}`}
      className="group block overflow-hidden rounded-card bg-surface transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-border">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={work.title}
            fill
            className="object-cover transition duration-200 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
            unoptimized={posterUrl.startsWith('/')}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-text-muted">
            <span className="text-sm">No poster</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <span className="text-sm font-medium text-white">
            ★ {rating}
          </span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 font-medium text-text group-hover:text-accent">
          {work.title}
        </h3>
        {work.genre && work.genre.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {work.genre.slice(0, 3).map((g) => (
              <span
                key={g}
                className="rounded bg-border px-1.5 py-0.5 text-xs text-text-muted"
              >
                {g}
              </span>
            ))}
          </div>
        )}
        {work.platform && work.platform.length > 0 && (
          <p className="mt-1 text-xs text-text-muted">
            {work.platform.map((p) => PLATFORM_NAMES[p] || p).join(', ')}
          </p>
        )}
      </div>
    </Link>
  )
}
