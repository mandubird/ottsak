import Image from 'next/image'
import type { Work } from '@/types/database'

export type AffiliateItemType = 'comic' | 'ost' | 'book' | 'goods' | 'dvd' | 'figure' | 'etc'

const AFFILIATE_ICON: Record<AffiliateItemType, string> = {
  comic: '📀',
  ost: '🎧',
  book: '📚',
  goods: '🛍️',
  dvd: '📀',
  figure: '🧸',
  etc: '🔗',
}

const AFFILIATE_DEFAULT_LABEL: Record<AffiliateItemType, string> = {
  comic: '원작 만화 보기',
  ost: 'OST 듣기',
  book: '세계관 설명 책',
  goods: '공식 굿즈',
  dvd: 'DVD·블루레이',
  figure: '피규어',
  etc: '더 보기',
}

export interface OfficialGoods {
  url: string
  imageUrl?: string | null
}

export interface AffiliateItem {
  type: AffiliateItemType
  label: string
  url: string
}

interface RevenueSectionProps {
  work: Work
  /** 1️⃣ 공식 굿즈 (있을 경우): 이미지 + "공식 굿즈 보러가기" */
  officialGoods?: OfficialGoods | null
  /** 2️⃣ 제휴 링크 (쿠팡 파트너스 등): 원작 만화, OST, 세계관 책 */
  affiliateItems?: AffiliateItem[]
}

/**
 * 수익 영역 — 공식 굿즈 블록 + 제휴 링크
 * 나중에 Elementor Pro / ACF 동적화 시 Post Title, ACF 한줄요약, ACF 링크, ACF YouTube URL 매핑 가능
 */
export function RevenueSection({
  work,
  officialGoods,
  affiliateItems = [],
}: RevenueSectionProps) {
  const hasOfficialGoods = officialGoods?.url
  const hasAffiliate = affiliateItems.length > 0

  if (!hasOfficialGoods && !hasAffiliate) {
    return (
      <section className="mx-auto max-w-content px-4 py-8">
        <h2 className="mb-4 font-heading text-xl font-bold uppercase tracking-wide text-text">
          수익 영역
        </h2>
        <p className="text-sm text-text-muted">
          이 작품의 공식 굿즈·제휴 링크는 준비 중입니다.
        </p>
        <p className="mt-3 text-xs text-text-muted">
          ※ 쿠팡 파트너스 등 제휴 링크 연동 시 여기에 노출됩니다.
        </p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-content px-4 py-8">
      <h2 className="mb-4 font-heading text-xl font-bold uppercase tracking-wide text-text">
        수익 영역
      </h2>

      <div className="space-y-8">
        {/* 1️⃣ 공식 굿즈 (있을 경우) */}
        {hasOfficialGoods && (
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
              {officialGoods.imageUrl && (
                <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg bg-border">
                  <Image
                    src={officialGoods.imageUrl}
                    alt="공식 굿즈"
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
              )}
              <div className="flex flex-1 items-center">
                <a
                  href={officialGoods.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                >
                  공식 굿즈 보러가기
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 2️⃣ 제휴 링크 (쿠팡 파트너스 등) */}
        {hasAffiliate && (
          <div>
            <h3 className="mb-3 text-sm font-medium text-text-muted">
              제휴 링크
            </h3>
            <ul className="space-y-2">
              {affiliateItems.map((item) => {
                const icon = AFFILIATE_ICON[item.type] ?? '🔗'
                const defaultLabel = AFFILIATE_DEFAULT_LABEL[item.type] ?? item.label
                const label = item.label || defaultLabel
                return (
                  <li key={item.url}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-accent hover:underline"
                    >
                      <span>{icon}</span>
                      <span>{label}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-text-muted">
        ※ 일부 링크는 제휴 링크를 포함할 수 있습니다.
      </p>
    </section>
  )
}
