import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchPopularInKorea } from '@/lib/ranking/fetchPopularKorea'

const CRON_SECRET = process.env.CRON_SECRET
const TOP_N = 10

/** ISO 주차 (1–53) */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export async function GET(request: NextRequest) {
  const token =
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() ||
    request.headers.get('x-cron-secret')?.trim()
  if (!CRON_SECRET || token !== CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const year = now.getFullYear()
  const week = getWeekNumber(now)

  const items = await fetchPopularInKorea()
  const top10 = items.slice(0, TOP_N)
  if (top10.length === 0) {
    return Response.json({ ok: false, message: 'No popular items', year, week })
  }

  const supabase = createClient()

  const platformNameToId = new Map<string, string>()
  const { data: platforms } = await supabase.from('platforms').select('id, name')
  platforms?.forEach((p) => platformNameToId.set(p.name, p.id))

  let saved = 0
  const errors: string[] = []

  for (let i = 0; i < top10.length; i++) {
    const item = top10[i]
    const tmdb = item.tmdb
    if (!tmdb) continue

    const { data: work, error: upsertErr } = await supabase
      .from('works')
      .upsert(
        {
          slug: tmdb.slug,
          title: tmdb.title,
          title_en: tmdb.title_en,
          type: tmdb.type,
          genre: tmdb.genre,
          platform: tmdb.platform,
          release_date: tmdb.release_date,
          rating: tmdb.rating,
          poster_url: tmdb.poster_url,
          backdrop_url: tmdb.backdrop_url,
          overview: tmdb.overview,
          tmdb_id: tmdb.tmdb_id,
        },
        { onConflict: 'tmdb_id', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    if (upsertErr || !work) {
      errors.push(`work ${tmdb.title}: ${upsertErr?.message ?? 'no row'}`)
      continue
    }

    for (const pName of item.platformNames) {
      const pid = platformNameToId.get(pName)
      if (pid) {
        await supabase.from('work_platforms').upsert(
          { work_id: work.id, platform_id: pid },
          { onConflict: 'work_id,platform_id' }
        )
      }
    }

    const score = top10.length - i
    const { error: rankErr } = await supabase.from('weekly_rankings').upsert(
      {
        work_id: work.id,
        rank: i + 1,
        score,
        week,
        year,
      },
      { onConflict: 'year,week,work_id' }
    )
    if (rankErr) errors.push(`rank ${tmdb.title}: ${rankErr.message}`)
    else saved++
  }

  return Response.json({
    ok: true,
    year,
    week,
    saved,
    total: top10.length,
    errors: errors.length ? errors : undefined,
  })
}
