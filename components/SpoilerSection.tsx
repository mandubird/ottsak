'use client'

import { useState } from 'react'
import type { Work } from '@/types/database'

const PREVIEW_LENGTH = 120

interface SpoilerSectionProps {
  work: Work
}

/** 스포 없는 줄거리 보기 [펼치기] — 클릭 시 전체 텍스트 */
export function SpoilerSection({ work }: SpoilerSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const text = work.overview?.trim() ?? ''
  const hasMore = text.length > PREVIEW_LENGTH
  const display = expanded || !hasMore ? text : `${text.slice(0, PREVIEW_LENGTH)}…`

  if (!text) return null

  return (
    <section className="mx-auto max-w-content px-4 py-8">
      <h2 className="mb-3 font-heading text-xl font-bold uppercase tracking-wide text-text">
        스포 방지 설명
      </h2>
      <p className="max-w-2xl whitespace-pre-wrap leading-relaxed text-text-muted">
        {display}
      </p>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-sm font-medium text-accent hover:underline"
        >
          {expanded ? '접기' : '스포 없는 줄거리 보기 [ 펼치기 ]'}
        </button>
      )}
      <p className="mt-2 text-xs text-text-muted">
        결말·핵심 반전은 언급하지 않았습니다.
      </p>
    </section>
  )
}
