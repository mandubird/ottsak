import type { Metadata } from 'next'
import { Montserrat, Noto_Sans_KR } from 'next/font/google'
import { BottomNav } from '@/components/BottomNav'
import './globals.css'

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: '오싹 | 한국 OTT 주간 인기 랭킹',
    template: '%s | 오싹',
  },
  description: '한국 OTT 통합 주간 TOP10, 영상 중심 랭킹 허브. 이번주 인기·지난주 비교·월간 정리.',
  keywords: ['OTT', '넷플릭스', '티빙', '디즈니플러스', '랭킹', '인기작', '예고편', '리뷰'],
  openGraph: {
    siteName: '오싹',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${montserrat.variable}`}>
      <body className="min-h-screen bg-bg text-text antialiased">
        {children}
        <BottomNav />
      </body>
    </html>
  )
}
