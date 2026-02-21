import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { VideoWithWork } from '@/types/database'

export const revalidate = 60

const DEFAULT_LIMIT = 50

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const type = searchParams.get('type')
  const workId = searchParams.get('work_id') ?? ''
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10))
  )

  const supabase = createClient()
  let query = supabase
    .from('videos')
    .select(`*, works (slug, title, poster_url)`)
    .order('view_count', { ascending: false })
    .limit(limit)

  if (type === 'trailer' || type === 'shorts' || type === 'review' || type === 'etc') {
    query = query.eq('video_type', type)
  }
  if (workId) query = query.eq('work_id', workId)

  const { data, error } = await query

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }

  const list = (data ?? []).map((v) => ({
    ...v,
    work: (v as { works?: unknown }).works ?? null,
  })) as VideoWithWork[]

  return Response.json({ data: list })
}
