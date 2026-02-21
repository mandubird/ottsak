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
  const auth = request.headers.get('authorization')
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!CRON_SECRET || token !== CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const since = thirtyDaysAgo.toISOString().split('T')[0]

  const { data: works, error: worksError } = await supabase
    .from('works')
    .select('id, slug, title, title_en')
    .gte('created_at', since)
    .order('created_at', { ascending: false })

  if (worksError || !works?.length) {
    return Response.json({
      synced: 0,
      pending: 0,
      skipped: 0,
      errors: [worksError?.message ?? 'No recent works'],
    })
  }

  let synced = 0
  let pending = 0
  let skipped = 0
  const errors: string[] = []

  for (const work of works as (Work & { title_en?: string | null })[]) {
    const searchTitle = work.title_en || work.title
    try {
      const videos = await fetchYouTubeVideos(searchTitle, 10)
      await sleep(DELAY_MS)

      for (const v of videos) {
        const { score } = matchWorkTitle(v.title, searchTitle)

        if (score >= 0.7) {
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
        } else if (score >= 0.5 && score < 0.7) {
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
