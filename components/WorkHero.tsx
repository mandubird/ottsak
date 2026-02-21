import Image from 'next/image'
import type { Work } from '@/types/database'

/**
 * 작품 상세 상단 비주얼: 배경 + 포스터만 표시
 * 제목·한줄요약·공개일·플랫폼 버튼은 WorkDetailSections에서 표시
 */
interface WorkHeroProps {
  work: Work
}

export function WorkHero({ work }: WorkHeroProps) {
  const backdropUrl = work.backdrop_url || work.poster_url
  const posterUrl = work.poster_url

  return (
    <section className="relative min-h-[40vh] overflow-hidden md:min-h-[50vh]">
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
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent" />
        </>
      )}
      <div className="relative mx-auto flex max-w-content items-end px-4 py-8 md:py-12">
        <div className="relative h-[280px] w-[186px] shrink-0 overflow-hidden rounded-card border border-border bg-border shadow-2xl md:h-[320px] md:w-[213px]">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={work.title}
              fill
              className="object-cover"
              sizes="213px"
              unoptimized={posterUrl.startsWith('/')}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-text-muted">
              No poster
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
