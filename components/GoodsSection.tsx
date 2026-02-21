import Image from 'next/image'
import type { Work } from '@/types/database'

export interface GoodsItem {
  name: string
  imageUrl?: string | null
  externalLink: string
  type?: 'poster' | 'figure' | 'ost' | 'goods'
}

interface GoodsSectionProps {
  work: Work
  items?: GoodsItem[]
}

/** 굿즈 — 포스터/피규어/OST/관련 상품 (MVP: 외부 링크) */
export function GoodsSection({ work, items = [] }: GoodsSectionProps) {
  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-content px-4 py-8">
        <h2 className="mb-4 font-heading text-xl font-bold uppercase tracking-wide text-text">
          🛍 굿즈
        </h2>
        <p className="text-sm text-text-muted">
          포스터 · 피규어 · OST · 관련 상품 링크는 준비 중입니다.
        </p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-content px-4 py-8">
      <h2 className="mb-4 font-heading text-xl font-bold uppercase tracking-wide text-text">
        🛍 굿즈
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {items.map((item) => (
          <a
            key={item.externalLink}
            href={item.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col overflow-hidden rounded-card bg-surface transition hover:shadow-xl"
          >
            {item.imageUrl ? (
              <div className="relative aspect-square w-full overflow-hidden bg-border">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover transition group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              </div>
            ) : (
              <div className="aspect-square w-full bg-border" />
            )}
            <div className="p-3">
              <p className="line-clamp-2 font-medium text-text group-hover:text-accent">
                {item.name}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
