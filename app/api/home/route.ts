import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

// Popularity score weights
const W_UPVOTES  = 2
const W_COMMENTS = 3
const W_VIEWS    = 1

export async function GET() {
  const supabase = createServiceClient()

  // Fetch all active threads (no subcategory filter — show everything)
  const { data: threads, error } = await supabase
    .from('threads')
    .select('*, subcategory:subcategories(id, name, slug, category:categories(name, slug, icon))')
    .neq('status', 'removed')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ threads: [] })

  // Sort by popularity score: upvotes*2 + comments*3 + views*1
  const ranked = (threads ?? [])
    .map((t) => ({
      ...t,
      _score: (t.upvotes ?? 0) * W_UPVOTES + (t.comment_count ?? 0) * W_COMMENTS + (t.view_count ?? 0) * W_VIEWS,
    }))
    .sort((a, b) => b._score - a._score)

  return NextResponse.json({ threads: ranked })
}
