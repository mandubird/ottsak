import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchTrendingWorks } from '@/lib/tmdb/fetchWorks'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  if (!CRON_SECRET) {
    return Response.json(
      { error: 'Unauthorized', hint: 'CRON_SECRET not set on server (check Vercel env)' },
      { status: 503 }
    )
  }
  const auth =
    request.headers.get('authorization') ??
    request.headers.get('Authorization') ??
    ''
  const bearerToken = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  const customHeader = request.headers.get('x-cron-secret')?.trim() ?? ''
  const token = bearerToken || customHeader
  if (!token) {
    return Response.json(
      {
        error: 'Unauthorized',
        hint: 'Send Authorization: Bearer <token> OR header X-Cron-Secret: <token>',
      },
      { status: 401 }
    )
  }
  if (token !== CRON_SECRET) {
    return Response.json(
      { error: 'Unauthorized', hint: 'Token does not match CRON_SECRET' },
      { status: 401 }
    )
  }

  const supabase = createClient()
  let added = 0
  let updated = 0
  const errors: string[] = []

  try {
    const works = await fetchTrendingWorks(30, 30)

    for (const w of works) {
      const { data: existing } = await supabase
        .from('works')
        .select('id')
        .eq('tmdb_id', w.tmdb_id)
        .single()

      const row = {
        slug: w.slug,
        title: w.title,
        title_en: w.title_en,
        type: w.type,
        genre: w.genre,
        platform: w.platform,
        release_date: w.release_date,
        rating: w.rating,
        poster_url: w.poster_url,
        backdrop_url: w.backdrop_url,
        overview: w.overview,
        tmdb_id: w.tmdb_id,
        updated_at: new Date().toISOString(),
      }

      if (existing) {
        const { error } = await supabase.from('works').update(row).eq('tmdb_id', w.tmdb_id)
        if (error) errors.push(`update ${w.tmdb_id}: ${error.message}`)
        else updated++
      } else {
        const { error } = await supabase.from('works').insert(row)
        if (error) errors.push(`insert ${w.tmdb_id}: ${error.message}`)
        else added++
      }
    }

    return Response.json({
      added,
      updated,
      total: works.length,
      errors: errors.length ? errors : undefined,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return Response.json(
      { error: msg, added, updated, errors },
      { status: 500 }
    )
  }
}
