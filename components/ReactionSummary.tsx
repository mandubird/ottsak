import type { Work } from '@/types/database'

interface ReactionSummaryProps {
  work: Work
}

/**
 * 반응/리뷰 요약 — placeholder.
 * 나중에 ACF/동적 데이터 연동 시 여기에 리뷰 요약·반응 요약 표시
 */
export function ReactionSummary({ work }: ReactionSummaryProps) {
  return (
    <section className="mx-auto max-w-content px-4 py-6">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-text-muted">
        반응 · 리뷰 요약
      </h2>
      <p className="text-sm text-text-muted">
        이 작품의 반응·리뷰 요약은 준비 중입니다.
      </p>
    </section>
  )
}
