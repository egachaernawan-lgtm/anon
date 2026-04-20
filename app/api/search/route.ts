import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 20
  const offset = (page - 1) * limit

  if (!q || q.length < 2) {
    return NextResponse.json({ threads: [] })
  }

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('threads')
    .select('*, subcategory:subcategories(id, name, slug, category:categories(name, slug, icon))')
    .neq('status', 'removed')
    .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
    .order('comment_count', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ threads: data })
}
