import Link from 'next/link'

export default function WorkNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="font-heading text-2xl font-bold text-text">작품을 찾을 수 없습니다</h1>
      <Link href="/works" className="mt-4 text-accent hover:underline">
        작품 목록으로
      </Link>
    </main>
  )
}
