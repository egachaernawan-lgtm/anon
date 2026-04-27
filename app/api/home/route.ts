import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { CATEGORIES } from '@/lib/categories'

export async function GET() {
  const supabase = createServiceClient()

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

  const allSubcategoryIds = CATEGORIES.flatMap((c) => c.subcategories?.map((s) => s.id) ?? [])
  const uncachedIds = allSubcategoryIds.filter((id) => !cacheMap.has(id))

  const fallbackResults: Record<string, unknown>[] = []
  if (uncachedIds.length > 0) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: recentData } = await supabase
      .from('threads')
      .select('*, subcategory:subcategories(id, name, slug, category:categories(name, slug, icon))')
      .in('subcategory_id', uncachedIds)
      .neq('status', 'removed')
      .gte('created_at', oneDayAgo)
      .order('comment_count', { ascending: false })

    const coveredIds = new Set<number>()
    for (const thread of recentData ?? []) {
      if (!coveredIds.has(thread.subcategory_id)) {
        coveredIds.add(thread.subcategory_id)
        fallbackResults.push(thread)
      }
    }

    const stillUncovered = uncachedIds.filter((id) => !coveredIds.has(id))
    if (stillUncovered.length > 0) {
      const { data: oldData } = await supabase
        .from('threads')
        .select('*, subcategory:subcategories(id, name, slug, category:categories(name, slug, icon))')
        .in('subcategory_id', stillUncovered)
        .neq('status', 'removed')
        .order('created_at', { ascending: false })

      const seen = new Set<number>()
      for (const thread of oldData ?? []) {
        if (!seen.has(thread.subcategory_id)) {
          seen.add(thread.subcategory_id)
          fallbackResults.push(thread)
        }
      }
    }
  }

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
