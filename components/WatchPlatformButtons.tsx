import type { Work } from '@/types/database'

/** 플랫폼별 브랜드 컬러 (어디서 볼까 버튼 1~2개, 컬러만 구분) */
const PLATFORM_STYLE: Record<
  string,
  { label: string; url: string; bg: string; text: string; hover?: string }
> = {
  'Netflix': {
    label: '넷플릭스',
    url: 'https://www.netflix.com/browse',
    bg: 'bg-[#E50914]',
    text: 'text-white',
    hover: 'hover:bg-[#f40612]',
  },
  'Disney+': {
    label: '디즈니+',
    url: 'https://www.disneyplus.com/',
    bg: 'bg-[#113CCF]',
    text: 'text-white',
    hover: 'hover:opacity-90',
  },
  'TVING': {
    label: '티빙',
    url: 'https://www.tving.com/',
    bg: 'bg-[#1E3A8A]',
    text: 'text-white',
    hover: 'hover:opacity-90',
  },
  'wavve': {
    label: '웨이브',
    url: 'https://www.wavve.com/',
    bg: 'bg-[#00C73C]',
    text: 'text-white',
    hover: 'hover:opacity-90',
  },
  'Watcha': {
    label: '왓챠',
    url: 'https://watcha.com/',
    bg: 'bg-black',
    text: 'text-white',
    hover: 'hover:opacity-90',
  },
  'Coupang Play': {
    label: '쿠팡플레이',
    url: 'https://www.coupangplay.com/',
    bg: 'bg-[#0073e9]',
    text: 'text-white',
    hover: 'hover:opacity-90',
  },
}

interface WatchPlatformButtonsProps {
  work: Work
}

/** 시청 플랫폼 버튼 — "어디서 볼까", 버튼 1~2개, 플랫폼별 컬러 */
export function WatchPlatformButtons({ work }: WatchPlatformButtonsProps) {
  const platforms = work.platform ?? []
  if (platforms.length === 0) return null

  return (
    <section className="mx-auto max-w-content px-4 py-6">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-text-muted">
        어디서 볼까
      </h2>
      <div className="flex flex-wrap gap-2">
        {platforms.slice(0, 4).map((p) => {
          const style = PLATFORM_STYLE[p]
          if (!style) {
            return (
              <a
                key={p}
                href="#"
                className="inline-flex rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition hover:bg-border/50"
              >
                {p}에서 보기
              </a>
            )
          }
          return (
            <a
              key={p}
              href={style.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex rounded-lg px-4 py-2.5 text-sm font-medium ${style.bg} ${style.text} transition ${style.hover ?? ''}`}
            >
              {style.label}에서 보기
            </a>
          )
        })}
      </div>
    </section>
  )
}
