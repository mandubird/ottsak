import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://otsak.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()
  const { data: works } = await supabase
    .from('works')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false })

  const workUrls = (works ?? []).map((w) => ({
    url: `${BASE_URL}/works/${w.slug}`,
    lastModified: w.updated_at ? new Date(w.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/works`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/videos`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/schedule`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    ...workUrls,
  ]
}
