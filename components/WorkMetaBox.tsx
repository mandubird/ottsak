import type { Work } from '@/types/database'

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr)
    .toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
    .replace(/\s/g, '-')
}

interface WorkMetaBoxProps {
  work: Work
}

/** 메타 정보 박스: 공개일, 종료일, 평점, 장르 */
export function WorkMetaBox({ work }: WorkMetaBoxProps) {
  const releaseLabel = formatDate(work.release_date)
  const endLabel = formatDate(work.end_date ?? null)

  return (
    <div className="rounded-xl border border-border bg-surface/60 p-4 md:p-5">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm md:flex md:flex-wrap md:gap-6">
        <div>
          <dt className="text-text-muted">공개</dt>
          <dd className="font-medium text-text">{releaseLabel}</dd>
        </div>
        <div>
          <dt className="text-text-muted">종료</dt>
          <dd className="font-medium text-text">{endLabel}</dd>
        </div>
        {work.rating != null && (
          <div>
            <dt className="text-text-muted">평점</dt>
            <dd className="font-medium text-accent">★ {work.rating.toFixed(1)}</dd>
          </div>
        )}
        {work.genre && work.genre.length > 0 && (
          <div className="col-span-2 md:col-span-1">
            <dt className="text-text-muted">장르</dt>
            <dd className="mt-0.5 flex flex-wrap gap-1.5">
              {work.genre.map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-border bg-bg px-2 py-0.5 text-xs text-text"
                >
                  {g}
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </div>
  )
}
