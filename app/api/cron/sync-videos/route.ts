import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchYouTubeVideos } from '@/lib/youtube/fetchVideos'
import { matchWorkTitle } from '@/lib/matching/fuzzyMatch'
import type { Work } from '@/types/database'

const CRON_SECRET = process.env.CRON_SECRET
const DELAY_MS = 500

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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

  const workSlug = request.nextUrl.searchParams.get('work_slug')?.trim()

  let works: (Work & { title_en?: string | null })[] | null = null
  let worksError: { message: string } | null = null

  if (workSlug) {
    const { data: one, error } = await supabase
      .from('works')
      .select('id, slug, title, title_en')
      .eq('slug', workSlug)
      .maybeSingle()
    if (error) worksError = error
    else if (one) works = [one as Work & { title_en?: string | null }]
  }

  if (!workSlug || !works?.length) {
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const sixMonthsAgo = new Date(now)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const sinceCreated = thirtyDaysAgo.toISOString().split('T')[0]
    const sinceRelease = sixMonthsAgo.toISOString().split('T')[0]

    // 최근 30일 추가된 작품 OR 출시 예정·최근 6개월 이내 출시 작품 (예고편은 출시 몇 달 전부터 올라옴)
    const result = await supabase
      .from('works')
      .select('id, slug, title, title_en')
      .or(`created_at.gte.${sinceCreated},release_date.gte.${sinceRelease}`)
      .order('release_date', { ascending: false, nullsFirst: false })

    worksError = result.error
    works = (result.data ?? []) as (Work & { title_en?: string | null })[]
  }

  if (worksError || !works?.length) {
    return Response.json({
      synced: 0,
      pending: 0,
      skipped: 0,
      errors: [worksError?.message ?? (workSlug ? `Work not found: ${workSlug}` : 'No recent works')],
    })
  }

  let synced = 0
  let pending = 0
  let skipped = 0
  const errors: string[] = []

  /** 공식 채널(넷플릭스/티빙 등) 가중치: 매칭 점수에 보너스 적용 */
  const OFFICIAL_CHANNEL_BONUS = 0.3
  const MATCH_THRESHOLD = 0.7
  const PENDING_THRESHOLD = 0.5

  for (const work of works) {
    const searchTitle = work.title_en || work.title
    try {
      const videos = await fetchYouTubeVideos(searchTitle, 12)
      await sleep(DELAY_MS)

      for (const v of videos) {
        const { score: rawScore } = matchWorkTitle(v.title, searchTitle)
        const score = v.is_official_channel
          ? Math.min(1, rawScore + OFFICIAL_CHANNEL_BONUS)
          : rawScore

        if (score >= MATCH_THRESHOLD) {
          const { error: upsertErr } = await supabase.from('videos').upsert(
            {
              work_id: work.id,
              youtube_id: v.youtube_id,
              title: v.title,
              video_type: v.video_type,
              thumbnail_url: v.thumbnail_url,
              channel_name: v.channel_name,
              view_count: v.view_count,
              duration_sec: v.duration_sec,
              match_score: score,
              published_at: v.published_at || null,
            },
            { onConflict: 'youtube_id' }
          )
          if (upsertErr) errors.push(`video ${v.youtube_id}: ${upsertErr.message}`)
          else synced++
        } else if (score >= PENDING_THRESHOLD && score < MATCH_THRESHOLD) {
          const { error: pendingErr } = await supabase.from('pending_videos').insert({
            youtube_id: v.youtube_id,
            title: v.title,
            guessed_work_title: work.title,
            match_score: score,
            raw_data: v as unknown as Record<string, unknown>,
          })
          if (!pendingErr) pending++
        } else {
          skipped++
        }
      }
    } catch (e) {
      errors.push(`work ${work.slug}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return Response.json({
    synced,
    pending,
    skipped,
    errors: errors.length ? errors : undefined,
  })
}
