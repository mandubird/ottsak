import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const CRON_SECRET = process.env.CRON_SECRET

/** URL 또는 영상 ID에서 YouTube ID만 추출 */
function parseYoutubeIds(input: string[]): string[] {
  const ids: string[] = []
  const idPattern = /^[a-zA-Z0-9_-]{11}$/
  const urlPattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  for (const s of input) {
    const trimmed = String(s).trim()
    if (!trimmed) continue
    const urlMatch = trimmed.match(urlPattern)
    if (urlMatch) ids.push(urlMatch[1])
    else if (idPattern.test(trimmed)) ids.push(trimmed)
  }
  return Array.from(new Set(ids))
}

/**
 * 관리자 전용: 작품에 수동으로 등록할 유튜브 영상 ID 설정
 * Body: { "youtube_ids": ["dQw4w9WgXcQ"] } 또는 URL 문자열 배열도 가능
 */
export async function PATCH(request: NextRequest) {
  const token =
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() ||
    request.headers.get('x-cron-secret')?.trim()
  if (!CRON_SECRET || token !== CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const slug = request.nextUrl.pathname.split('/').filter(Boolean).slice(-2)[0]
  if (!slug) {
    return Response.json({ error: 'slug required' }, { status: 400 })
  }

  let body: { youtube_ids?: string[] }
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { error: 'JSON body required. Example: { "youtube_ids": ["VIDEO_ID"] }' },
      { status: 400 }
    )
  }

  const raw = Array.isArray(body.youtube_ids) ? body.youtube_ids : []
  const youtube_ids = parseYoutubeIds(raw)

  const supabase = createClient()
  const { data: work, error: findError } = await supabase
    .from('works')
    .select('id')
    .eq('slug', slug)
    .single()

  if (findError || !work) {
    return Response.json({ error: 'Work not found' }, { status: 404 })
  }

  const { error: updateError } = await supabase
    .from('works')
    .update({ manual_video_ids: youtube_ids })
    .eq('id', work.id)

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 })
  }

  return Response.json({ ok: true, manual_video_ids: youtube_ids })
}
