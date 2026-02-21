import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchWorkByTitle } from '@/lib/tmdb/fetchWorks'

const CRON_SECRET = process.env.CRON_SECRET

export async function POST(request: NextRequest) {
  const auth =
    request.headers.get('authorization') ?? request.headers.get('Authorization') ?? ''
  const bearerToken = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  const customHeader = request.headers.get('x-cron-secret')?.trim() ?? ''
  const token = bearerToken || customHeader
  if (!CRON_SECRET || token !== CRON_SECRET) {
    return Response.json(
      { error: 'Unauthorized', hint: 'Send X-Cron-Secret header' },
      { status: 401 }
    )
  }

  let body: { titles?: string[] }
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { error: 'Invalid JSON body. Use { "titles": ["작품명1", "작품명2", ...] }' },
      { status: 400 }
    )
  }

  const titles = Array.isArray(body.titles) ? body.titles : []
  if (titles.length === 0) {
    return Response.json(
      { error: 'titles array is required', added: 0, skipped: 0 },
      { status: 400 }
    )
  }

  const supabase = createClient()
  let added = 0
  let skipped = 0
  const errors: string[] = []

  for (const title of titles) {
    try {
      const row = await fetchWorkByTitle(title)
      if (!row) {
        errors.push(`"${title}": 검색 결과 없음`)
        continue
      }

      const { data: existing } = await supabase
        .from('works')
        .select('id')
        .eq('tmdb_id', row.tmdb_id)
        .single()

      if (existing) {
        skipped++
        continue
      }

      const { error: insertErr } = await supabase.from('works').insert({
        slug: row.slug,
        title: row.title,
        title_en: row.title_en,
        type: row.type,
        genre: row.genre,
        platform: row.platform,
        release_date: row.release_date,
        rating: row.rating,
        poster_url: row.poster_url,
        backdrop_url: row.backdrop_url,
        overview: row.overview,
        tmdb_id: row.tmdb_id,
      })

      if (insertErr) {
        errors.push(`"${title}": ${insertErr.message}`)
      } else {
        added++
      }

      await new Promise((r) => setTimeout(r, 200))
    } catch (e) {
      errors.push(`"${title}": ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return Response.json({
    added,
    skipped,
    total: titles.length,
    errors: errors.length ? errors : undefined,
  })
}
