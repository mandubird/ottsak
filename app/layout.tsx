import type { Metadata } from 'next'
import { Montserrat, Noto_Sans_KR } from 'next/font/google'
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
    default: '옽싹 | OTT 작품 판단 허브',
    template: '%s | 옽싹',
  },
  description: '보기 전에 판단한다. 예고편, 리뷰, 평점을 한눈에.',
  keywords: ['OTT', '넷플릭스', '드라마', '영화', '예고편', '리뷰'],
  openGraph: {
    siteName: '옽싹',
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
      </body>
    </html>
  )
}
