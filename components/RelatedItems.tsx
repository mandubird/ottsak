import type { Work } from '@/types/database'

/**
 * 작품 상세 페이지 — 영상 아래 "관련 아이템" 섹션
 * 수익 모델 1차: 공식 굿즈 / OST / 원작 도서 등 제휴 링크 (작품별로 추후 연동)
 * @see docs/수익-모델.md
 */
interface RelatedItemsProps {
  work: Work
  /** 작품별 관련 링크 (추후 DB/API 연동) */
  items?: Array<{
    type: 'goods' | 'ost' | 'book' | 'game' | 'dvd' | 'figure'
    label: string
    url: string
  }>
}

const TYPE_LABELS: Record<string, string> = {
  goods: '공식 굿즈',
  ost: 'OST',
  book: '원작 도서',
  game: '관련 게임',
  dvd: 'DVD·블루레이',
  figure: '피규어',
}

export function RelatedItems({ work, items = [] }: RelatedItemsProps) {
  return (
    <section className="mx-auto max-w-content px-4 py-8">
      <h2 className="mb-4 font-heading text-xl font-bold uppercase tracking-wide text-text">
        관련 아이템
      </h2>
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.url}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-accent hover:underline"
              >
                <span className="text-text-muted">
                  {TYPE_LABELS[item.type] ?? item.type}:
                </span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-muted">
          이 작품의 공식 굿즈·OST·원작 도서 링크는 준비 중입니다.
        </p>
      )}
      <p className="mt-4 text-xs text-text-muted">
        ※ 일부 링크는 제휴 링크를 포함할 수 있습니다.
      </p>
    </section>
  )
}
