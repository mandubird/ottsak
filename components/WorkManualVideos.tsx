'use client'

/**
 * 관리자가 작품에 수동으로 등록한 유튜브 영상 (작품 상세 영상 섹션 상단)
 */
interface WorkManualVideosProps {
  youtubeIds: string[]
  /** 옵션: 자동재생, 반복 등 (추후 확장) */
  autoplay?: boolean
}

const YOUTUBE_EMBED = 'https://www.youtube.com/embed'

export function WorkManualVideos({ youtubeIds, autoplay = false }: WorkManualVideosProps) {
  const list = youtubeIds.filter((id) => id.length === 11)
  if (list.length === 0) return null

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-xl font-bold uppercase tracking-wide text-text">
        영상
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {list.map((id) => (
          <div key={id} className="overflow-hidden rounded-card bg-surface">
            <div className="relative aspect-video w-full">
              <iframe
                src={`${YOUTUBE_EMBED}/${id}?rel=0${autoplay ? '&autoplay=1' : ''}`}
                title={`YouTube ${id}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
