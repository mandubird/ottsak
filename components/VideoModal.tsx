'use client'

import { useEffect } from 'react'
import { YouTubeIframe } from './YouTubeIframe'

interface VideoModalProps {
  youtubeId: string | null
  onClose: () => void
}

/** ESC로 닫기, 배경 어둡게, 클릭 시 iframe 재생 */
export function VideoModal({ youtubeId, onClose }: VideoModalProps) {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [onClose])

  if (!youtubeId) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="영상 재생"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-10 right-0 rounded bg-surface px-3 py-2 text-sm text-text hover:bg-border"
        >
          닫기 (ESC)
        </button>
        <YouTubeIframe youtubeId={youtubeId} autoplay />
      </div>
    </div>
  )
}
