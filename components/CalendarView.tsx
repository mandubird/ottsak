'use client'

import { useMemo, useState } from 'react'
import { WorkCard } from './WorkCard'
import type { Work } from '@/types/database'

interface CalendarViewProps {
  upcomingWorks: Work[]
}

export function CalendarView({ upcomingWorks }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const worksByDate = useMemo(() => {
    const map = new Map<string, Work[]>()
    for (const work of upcomingWorks) {
      if (!work.release_date) continue
      const key = work.release_date
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(work)
    }
    return map
  }, [upcomingWorks])

  const dates = useMemo(
    () => Array.from(worksByDate.keys()).sort(),
    [worksByDate]
  )

  const selectedWorks = selectedDate ? worksByDate.get(selectedDate) ?? [] : []

  return (
    <section className="mx-auto max-w-content px-4 py-8">
      <h2 className="mb-6 font-heading text-2xl font-bold uppercase tracking-wide text-text">
        공개 일정
      </h2>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="rounded-card border border-border bg-surface p-4">
          <h3 className="mb-3 text-sm font-medium text-text-muted">날짜 선택</h3>
          <div className="flex flex-col gap-1">
            {dates.length === 0 ? (
              <p className="text-sm text-text-muted">예정된 작품이 없습니다.</p>
            ) : (
              dates.map((d) => {
                const label = new Date(d).toLocaleDateString('ko-KR', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })
                const count = worksByDate.get(d)?.length ?? 0
                const isSelected = selectedDate === d
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDate(isSelected ? null : d)}
                    className={`rounded px-3 py-2 text-left text-sm transition ${
                      isSelected
                        ? 'bg-accent text-white'
                        : 'text-text hover:bg-border'
                    }`}
                  >
                    {label} ({count}편)
                  </button>
                )
              })
            )}
          </div>
        </div>
        <div className="lg:col-span-2">
          {selectedDate ? (
            <>
              <h3 className="mb-4 text-lg font-medium text-text">
                {new Date(selectedDate).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                공개 작품
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {selectedWorks.map((work) => (
                  <WorkCard key={work.id} work={work} />
                ))}
              </div>
            </>
          ) : (
            <p className="py-8 text-center text-text-muted">
              왼쪽에서 날짜를 선택하면 해당 날짜에 공개되는 작품을 볼 수 있습니다.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
