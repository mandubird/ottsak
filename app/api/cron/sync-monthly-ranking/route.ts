import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  const token =
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() ||
    request.headers.get('x-cron-secret')?.trim()
  if (!CRON_SECRET || token !== CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const lastMonth = month === 0 ? 11 : month - 1
  const lastMonthYear = month === 0 ? year - 1 : year
  const firstDay = new Date(lastMonthYear, lastMonth, 1)
  const lastDay = new Date(lastMonthYear, lastMonth + 1, 0)
  const from = firstDay.toISOString().slice(0, 10)
  const to = lastDay.toISOString().slice(0, 10)

  const supabase = createClient()

  const { data: rows, error: selectErr } = await supabase
    .from('weekly_rankings')
    .select('work_id, score')
    .gte('created_at', `${from}T00:00:00Z`)
    .lte('created_at', `${to}T23:59:59Z`)

  if (selectErr) {
    return Response.json({ ok: false, error: selectErr.message }, { status: 500 })
  }

  const byWork = new Map<string, { sum: number; count: number }>()
  for (const r of rows ?? []) {
    const cur = byWork.get(r.work_id) ?? { sum: 0, count: 0 }
    cur.sum += Number(r.score)
    cur.count += 1
    byWork.set(r.work_id, cur)
  }

  const averaged = Array.from(byWork.entries())
    .map(([work_id, { sum, count }]) => ({ work_id, score: sum / count }))
    .sort((a, b) => b.score - a.score)

  const targetMonth = lastMonth + 1
  for (let i = 0; i < averaged.length; i++) {
    await supabase.from('monthly_rankings').upsert(
      {
        work_id: averaged[i].work_id,
        rank: i + 1,
        score: averaged[i].score,
        month: targetMonth,
        year: lastMonthYear,
      },
      { onConflict: 'year,month,work_id' }
    )
  }

  return Response.json({
    ok: true,
    year: lastMonthYear,
    month: lastMonth + 1,
    count: averaged.length,
  })
}
