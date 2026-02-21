import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Work } from '@/types/database'

export const revalidate = 60

const LIMIT_MAX = 100
const DEFAULT_LIMIT = 20

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const genre = searchParams.get('genre') ?? ''
  const type = searchParams.get('type')
  const sort = searchParams.get('sort') ?? 'latest'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(
    LIMIT_MAX,
    Math.max(1, parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10))
  )

  const supabase = createClient()
  let query = supabase.from('works').select('*', { count: 'exact' })

  if (genre) query = query.contains('genre', [genre])
  if (type === 'movie' || type === 'series') query = query.eq('type', type)

  if (sort === 'latest') {
    query = query.order('created_at', { ascending: false })
  } else if (sort === 'popular') {
    query = query.order('view_count', { ascending: false })
  } else if (sort === 'rating') {
    query = query.order('rating', { ascending: false, nullsFirst: false })
  }

  const from = (page - 1) * limit
  const { data, count, error } = await query.range(from, from + limit - 1)

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }

  const total = count ?? 0
  const totalPages = Math.ceil(total / limit)

  return Response.json({
    data: (data ?? []) as Work[],
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  })
}
