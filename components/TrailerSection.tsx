import { YouTubeIframe } from './YouTubeIframe'
import type { Video } from '@/types/database'

interface TrailerSectionProps {
  /** 조회수 가장 높은 공식 예고편 1개 (또는 수동 등록 첫 번째) */
  trailerVideo: Video | null
  /** 수동 등록 예고편 youtube_id (trailerVideo 없을 때 사용) */
  manualTrailerId?: string | null
}

/** 공식 예고편 1개, 16:9 iframe. 수동 등록이 있으면 수동 우선(고정 예고편용) */
export function TrailerSection({ trailerVideo, manualTrailerId }: TrailerSectionProps) {
  const manualId = manualTrailerId && manualTrailerId.length === 11 ? manualTrailerId : null
  const youtubeId = manualId ?? trailerVideo?.youtube_id ?? null

  if (!youtubeId) return null

  return (
    <section className="mx-auto max-w-content px-4 py-8">
      <h2 className="mb-4 font-heading text-xl font-bold uppercase tracking-wide text-text">
        🎥 공식 예고편
      </h2>
      <YouTubeIframe youtubeId={youtubeId} />
    </section>
  )
}
