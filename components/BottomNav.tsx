'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS = [
  { href: '/', label: '홈', icon: '🏠' },
  { href: '/ranking', label: '랭킹', icon: '📊' },
  { href: '/search', label: '검색', icon: '🔍' },
  { href: '/videos', label: '영상', icon: '🎥' },
  { href: '/works', label: '작품', icon: '🎬' },
  { href: '/schedule', label: '달력', icon: '📅' },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bg/95 backdrop-blur md:hidden"
      aria-label="하단 메뉴"
    >
      <div className="flex justify-around py-2">
        {ITEMS.map(({ href, label, icon }) => {
          const isActive =
            href === '/'
              ? pathname === '/'
              : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition ${
                isActive ? 'text-accent' : 'text-text-muted'
              }`}
            >
              <span className="text-lg" aria-hidden>
                {icon}
              </span>
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
