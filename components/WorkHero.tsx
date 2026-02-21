import Image from 'next/image'
import type { Work } from '@/types/database'

const PLATFORM_NAMES: Record<string, string> = {
  'Netflix': '넷플릭스',
  'Disney+': '디즈니+',
  'wavve': '웨이브',
  'Watcha': '왓챠',
  'Coupang Play': '쿠팡플레이',
  'TVING': '티빙',
}

const PLATFORM_URLS: Record<string, string> = {
  'Netflix': 'https://www.netflix.com/browse',
  'Disney+': 'https://www.disneyplus.com/',
  'wavve': 'https://www.wavve.com/',
  'Watcha': 'https://watcha.com/',
  'Coupang Play': 'https://www.coupangplay.com/',
  'TVING': 'https://www.tving.com/',
}

interface WorkHeroProps {
  work: Work
}

export function WorkHero({ work }: WorkHeroProps) {
  const backdropUrl = work.backdrop_url || work.poster_url
  const posterUrl = work.poster_url
  const rating = work.rating != null ? work.rating.toFixed(1) : '-'
  const releaseLabel = work.release_date
    ? new Date(work.release_date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <section className="relative min-h-[70vh] overflow-hidden">
      {backdropUrl && (
        <>
          <Image
            src={backdropUrl}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
            unoptimized={backdropUrl.startsWith('/')}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent" />
        </>
      )}
      <div className="relative mx-auto flex max-w-content flex-col gap-6 px-4 py-12 md:flex-row md:items-end md:py-16">
        <div className="relative h-[360px] w-[240px] shrink-0 overflow-hidden rounded-card bg-border shadow-2xl">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={work.title}
              fill
              className="object-cover"
              sizes="240px"
              unoptimized={posterUrl.startsWith('/')}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-text-muted">
              No poster
            </div>
          )}
        </div>
        <div className="flex-1 pb-4">
          <h1 className="font-heading text-4xl font-bold uppercase tracking-wide text-text md:text-5xl">
            {work.title}
          </h1>
          {work.title_en && (
            <p className="mt-1 text-lg text-text-muted">{work.title_en}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1 text-lg text-accent">
              ★ {rating}
            </span>
            {work.genre && work.genre.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {work.genre.map((g) => (
                  <span
                    key={g}
                    className="rounded-full border border-border bg-surface/80 px-3 py-1 text-sm text-text"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
            {releaseLabel && (
              <span className="text-sm text-text-muted">공개일 {releaseLabel}</span>
            )}
          </div>
          {work.platform && work.platform.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {work.platform.map((p) => {
                const url = PLATFORM_URLS[p]
                const label = PLATFORM_NAMES[p] || p
                return url ? (
                  <a
                    key={p}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    {label}에서 보기
                  </a>
                ) : (
                  <span
                    key={p}
                    className="inline-flex items-center rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text-muted"
                  >
                    {label}
                  </span>
                )
              })}
            </div>
          )}
          {work.overview && (
            <p className="mt-4 max-w-2xl text-text-muted leading-relaxed line-clamp-5">
              {work.overview}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
