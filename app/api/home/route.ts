import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { CATEGORIES } from '@/lib/categories'

export async function GET() {
  const supabase = createServiceClient()

  // Try to get cached home feed first
  const { data: cached } = await supabase
    .from('home_feed_cache')
    .select('subcategory_id, thread_id, updated_at')

  const cacheMap = new Map(cached?.map((c) => [c.subcategory_id, c]) ?? [])
  const threadIds = (cached ?? []).map((c) => c.thread_id).filter(Boolean)

  let cachedThreads: Record<string, unknown>[] = []
  if (threadIds.length > 0) {
    const { data } = await supabase
      .from('threads')
      .select('*, subcategory:subcategories(id, name, slug, category:categories(name, slug, icon))')
      .in('id', threadIds)
      .neq('status', 'removed')
    cachedThreads = data ?? []
  }

  // For subcategories without cache, fetch the most active thread in last 24h
  const allSubcategoryIds = CATEGORIES.flatMap((c) => c.subcategories?.map((s) => s.id) ?? [])
  const uncachedIds = allSubcategoryIds.filter((id) => !cacheMap.has(id))

  const fallbackResults: Record<string, unknown>[] = []
  if (uncachedIds.length > 0) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data } = await supabase
      .from('threads')
      .select('*, subcategory:subcategories(id, name, slug, category:categories(name, slug, icon))')
      .in('subcategory_id', uncachedIds)
      .neq('status', 'removed')
      .gte('created_at', oneDayAgo)
      .order('comment_count', { ascending: false })

    // Pick top thread per subcategory
    const seen = new Set<number>()
    for (const thread of data ?? []) {
      if (!seen.has(thread.subcategory_id)) {
        seen.add(thread.subcategory_id)
        fallbackResults.push(thread)
      }
    }
  }

  // Combine and group by subcategory
  const allThreads = [...cachedThreads, ...fallbackResults]
  const bySubcategory = new Map<number, unknown>()
  for (const thread of allThreads) {
    const t = thread as { subcategory_id: number }
    if (!bySubcategory.has(t.subcategory_id)) {
      bySubcategory.set(t.subcategory_id, thread)
    }
  }

  return NextResponse.json({ feed: Object.fromEntries(bySubcategory) })
}
