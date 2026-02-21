'use client'

import type { Work } from '@/types/database'

/**
 * 작품 상세 — 제목, 한 줄 요약, 공유
 * (메타/영상/플랫폼/수익은 각각 별도 섹션)
 */
interface WorkDetailSectionsProps {
  work: Work
}

export function WorkDetailSections({ work }: WorkDetailSectionsProps) {
  return (
    <section className="mx-auto max-w-content px-4 pt-6 pb-4">
      {/* 1. 제목 (Post Title에 대응) */}
      <h1 className="font-heading text-3xl font-bold uppercase tracking-wide text-text md:text-4xl">
        {work.title}
      </h1>
      {work.title_en && (
        <p className="mt-1 text-lg text-text-muted">{work.title_en}</p>
      )}

      {/* 2. 한 줄 요약 (ACF 한 줄 요약에 대응) */}
      {work.overview && (
        <p className="mt-4 max-w-2xl leading-relaxed text-text-muted">
          {work.overview}
        </p>
      )}

      {/* 공유 */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-sm text-text-muted">공유</span>
        <button
          type="button"
          onClick={() => {
            const url = typeof window !== 'undefined' ? window.location.href : ''
            if (typeof navigator !== 'undefined' && navigator.share) {
              navigator
                .share({
                  title: `${work.title} — 오싹`,
                  url,
                  text: work.overview ?? work.title,
                })
                .catch(() => {})
            } else {
              navigator.clipboard?.writeText(url).then(() => {}).catch(() => {})
            }
          }}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-border/50"
        >
          링크 복사
        </button>
      </div>
    </section>
  )
}
