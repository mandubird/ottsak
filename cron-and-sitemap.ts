// ============================================================
// app/api/cron/sync-videos/route.ts
// Vercel Cron Job - 매일 자동 영상 수집
// vercel.json 설정: {"crons":[{"path":"/api/cron/sync-videos","schedule":"0 3 * * *"}]}
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { fetchYouTubeVideos } from '@/lib/youtube/fetchVideos'
import { matchWorkTitle } from '@/lib/matching/fuzzyMatch'

export const maxDuration = 60  // 최대 실행 시간 60초

export async function GET(req: Request) {
  // 인증 체크 (무단 접근 방지)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient()
  const results = { synced: 0, skipped: 0, pending: 0, errors: [] as string[] }

  try {
    // 최근 30일 내 등록된 작품만 처리 (YouTube API 할당량 절약)
    const { data: works, error: worksError } = await supabase
      .from('works')
      .select('id, title, title_en')
      .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
      .limit(50)  // 하루 최대 50개 작품 처리

    if (worksError) throw worksError
    if (!works?.length) {
      return Response.json({ message: '처리할 작품 없음', ...results })
    }

    for (const work of works) {
      try {
        const searchTitle = work.title_en || work.title
        const videos = await fetchYouTubeVideos(searchTitle, 8)

        for (const video of videos) {
          // Fuzzy Matching으로 정확도 검증
          const { score } = matchWorkTitle(video.title, work.title)

          if (score >= 0.7) {
            // 정확도 70% 이상 → videos 테이블에 저장 (중복 시 덮어쓰기)
            const { error } = await supabase
              .from('videos')
              .upsert(
                { ...video, work_id: work.id, match_score: score },
                { onConflict: 'youtube_id' }
              )

            if (error) {
              results.skipped++
              results.errors.push(`${video.youtube_id}: ${error.message}`)
            } else {
              results.synced++
            }
          } else if (score >= 0.5) {
            // 정확도 50~70% → pending_videos에 보류
            await supabase
              .from('pending_videos')
              .upsert(
                {
                  youtube_id: video.youtube_id,
                  title: video.title,
                  guessed_work_title: work.title,
                  match_score: score,
                  raw_data: video,
                  reviewed: false,
                },
                { onConflict: 'youtube_id' }
              )
            results.pending++
          }
          // score < 0.5: 폐기 (아무것도 저장 안 함)
        }

        // YouTube API 과부하 방지 (요청 간 500ms 딜레이)
        await new Promise(r => setTimeout(r, 500))

      } catch (workError: any) {
        results.errors.push(`작품 ${work.id}: ${workError.message}`)
      }
    }

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...results,
    })

  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}


// ============================================================
// app/api/works/route.ts
// 작품 목록 API (장르/타입 필터, 페이지네이션, ISR)
// ============================================================
import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 60  // ISR: 60초마다 재검증

// export async function GET(req: NextRequest) {
//   const { searchParams } = req.nextUrl
//   const genre  = searchParams.get('genre')
//   const type   = searchParams.get('type')
//   const sort   = searchParams.get('sort') ?? 'latest'
//   const limit  = Math.min(Number(searchParams.get('limit')) || 20, 100)
//   const page   = Math.max(Number(searchParams.get('page')) || 1, 1)
//
//   const supabase = createClient()
//   let query = supabase
//     .from('works')
//     .select('id, slug, title, type, genre, platform, release_date, rating, poster_url, view_count', { count: 'exact' })
//
//   if (genre) query = query.contains('genre', [genre])
//   if (type)  query = query.eq('type', type)
//
//   switch (sort) {
//     case 'popular': query = query.order('view_count', { ascending: false }); break
//     case 'rating':  query = query.order('rating', { ascending: false }); break
//     default:        query = query.order('release_date', { ascending: false, nullsFirst: false })
//   }
//
//   const from = (page - 1) * limit
//   query = query.range(from, from + limit - 1)
//
//   const { data, error, count } = await query
//   if (error) return NextResponse.json({ error }, { status: 500 })
//
//   return NextResponse.json({
//     data,
//     meta: { total: count ?? 0, page, limit, totalPages: Math.ceil((count ?? 0) / limit) }
//   })
// }


// ============================================================
// app/sitemap.ts
// 자동 sitemap.xml 생성 (SEO)
// ============================================================
import type { MetadataRoute } from 'next'

const SITE_URL = 'https://otsak.com'

// export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
//   const supabase = createClient()
//   const { data: works } = await supabase
//     .from('works')
//     .select('slug, updated_at')
//     .order('updated_at', { ascending: false })
//
//   const workPages: MetadataRoute.Sitemap = (works ?? []).map(w => ({
//     url: `${SITE_URL}/works/${w.slug}`,
//     lastModified: new Date(w.updated_at),
//     changeFrequency: 'weekly' as const,
//     priority: 0.8,
//   }))
//
//   return [
//     { url: SITE_URL,                changeFrequency: 'daily',  priority: 1.0 },
//     { url: `${SITE_URL}/works`,     changeFrequency: 'daily',  priority: 0.9 },
//     { url: `${SITE_URL}/videos`,    changeFrequency: 'daily',  priority: 0.8 },
//     { url: `${SITE_URL}/schedule`,  changeFrequency: 'weekly', priority: 0.7 },
//     ...workPages,
//   ]
// }


// ============================================================
// vercel.json (프로젝트 루트에 생성)
// ============================================================
// {
//   "crons": [
//     {
//       "path": "/api/cron/sync-videos",
//       "schedule": "0 3 * * *"
//     }
//   ]
// }


// ============================================================
// .env.local 예시
// ============================================================
// NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
// SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...  ← Cron에서 사용
// YOUTUBE_API_KEY=AIzaSy...
// TMDB_API_KEY=abc123...
// CRON_SECRET=my-super-secret-key-change-this
