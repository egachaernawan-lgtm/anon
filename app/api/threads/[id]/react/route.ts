import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { getUserUUIDFromCookie } from '@/lib/user'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieHeader = request.headers.get('cookie') ?? ''
  const userUuid = getUserUUIDFromCookie(cookieHeader)

  if (!userUuid) {
    return NextResponse.json({ error: 'Identitas tidak ditemukan' }, { status: 401 })
  }

  const { type } = await request.json() // 'up' | 'down'

  if (!['up', 'down'].includes(type)) {
    return NextResponse.json({ error: 'Tipe tidak valid' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Check existing reaction
  const { data: existing } = await supabase
    .from('thread_reactions')
    .select('type')
    .eq('thread_id', id)
    .eq('user_uuid', userUuid)
    .single()

  if (existing) {
    if (existing.type === type) {
      // Toggle off
      await supabase
        .from('thread_reactions')
        .delete()
        .eq('thread_id', id)
        .eq('user_uuid', userUuid)

      const col = type === 'up' ? 'upvotes' : 'downvotes'
      await supabase.rpc('decrement_thread_reaction', { thread_id: id, col_name: col })
      return NextResponse.json({ reaction: null })
    } else {
      // Switch reaction
      await supabase
        .from('thread_reactions')
        .update({ type })
        .eq('thread_id', id)
        .eq('user_uuid', userUuid)

      const addCol = type === 'up' ? 'upvotes' : 'downvotes'
      const subCol = type === 'up' ? 'downvotes' : 'upvotes'
      await supabase.rpc('switch_thread_reaction', { thread_id: id, add_col: addCol, sub_col: subCol })
      return NextResponse.json({ reaction: type })
    }
  }

  // New reaction
  await supabase.from('thread_reactions').insert({ thread_id: id, user_uuid: userUuid, type })
  const col = type === 'up' ? 'upvotes' : 'downvotes'
  await supabase.rpc('increment_thread_reaction', { thread_id: id, col_name: col })

  return NextResponse.json({ reaction: type })
}
