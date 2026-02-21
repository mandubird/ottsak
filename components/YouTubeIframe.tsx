'use client'

const EMBED_BASE = 'https://www.youtube.com/embed'

interface YouTubeIframeProps {
  youtubeId: string
  /** 자동재생 false, 음소거 false (클릭 시 재생) */
  autoplay?: boolean
  className?: string
}

/** 16:9 반응형, lazy loading */
export function YouTubeIframe({
  youtubeId,
  autoplay = false,
  className = '',
}: YouTubeIframeProps) {
  const src = `${EMBED_BASE}/${youtubeId}?rel=0${autoplay ? '&autoplay=1&mute=1' : ''}`

  return (
    <div className={`relative w-full overflow-hidden rounded-card bg-black ${className}`}>
      <div className="relative aspect-video w-full">
        <iframe
          src={src}
          title="YouTube"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  )
}
