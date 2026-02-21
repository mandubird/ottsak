import Image from 'next/image'
import type { Work } from '@/types/database'

const PLATFORM_NAMES: Record<string, string> = {
  'Netflix': '넷플릭스',
  'Disney+': '디즈니+',
  'TVING': '티빙',
  'wavve': '웨이브',
  'Watcha': '왓챠',
  'Coupang Play': '쿠팡플레이',
}

interface WorkHeroProps {
  work: Work
}

/** Hero: 왼쪽 포스터, 오른쪽 제목·시즌정보·장르·공개일·플랫폼 뱃지·한줄요약 */
export function WorkHero({ work }: WorkHeroProps) {
  const releaseLabel = work.release_date
    ? new Date(work.release_date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <section className="border-b border-border bg-surface/30">
      <div className="mx-auto flex max-w-content flex-col gap-6 px-4 py-8 md:flex-row md:items-start md:gap-10">
        <div className="relative h-[360px] w-[240px] shrink-0 overflow-hidden rounded-card border border-border bg-border shadow-xl md:h-[400px] md:w-[266px]">
          {work.poster_url ? (
            <Image
              src={work.poster_url}
              alt={work.title}
              fill
              className="object-cover"
              priority
              sizes="266px"
              unoptimized={work.poster_url.startsWith('/')}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-text-muted text-sm">
              No poster
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wide text-text md:text-4xl">
            {work.title}
          </h1>
          {work.title_en && (
            <p className="mt-1 text-lg text-text-muted">{work.title_en}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded bg-border px-2 py-0.5 text-text-muted">
              {work.type === 'series' ? '시리즈' : '영화'}
            </span>
            {work.genre?.map((g) => (
              <span
                key={g}
                className="rounded-full border border-border bg-bg px-2.5 py-0.5 text-text"
              >
                {g}
              </span>
            ))}
            {releaseLabel && (
              <span className="text-text-muted">공개 {releaseLabel}</span>
            )}
          </div>
          {work.platform && work.platform.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {work.platform.map((p) => (
                <span
                  key={p}
                  className="rounded-lg border border-accent/50 bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent"
                >
                  {PLATFORM_NAMES[p] ?? p}
                </span>
              ))}
            </div>
          )}
          {work.overview && (
            <p className="mt-4 max-w-2xl leading-relaxed text-text-muted">
              {work.overview}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
