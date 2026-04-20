import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { hashOwnerToken } from '@/lib/mask'
import { getUserUUIDFromCookie } from '@/lib/user'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieHeader = request.headers.get('cookie') ?? ''
  const userUuid = getUserUUIDFromCookie(cookieHeader)

  const supabase = createServiceClient()

  const { data: thread, error } = await supabase
    .from('threads')
    .select('*, subcategory:subcategories(id, name, slug, category:categories(name, slug, icon))')
    .eq('id', id)
    .neq('status', 'removed')
    .single()

  if (error || !thread) {
    return NextResponse.json({ error: 'Thread tidak ditemukan' }, { status: 404 })
  }

  // Fetch user's reaction if logged in
  let userReaction = null
  if (userUuid) {
    const { data: reaction } = await supabase
      .from('thread_reactions')
      .select('type')
      .eq('thread_id', id)
      .eq('user_uuid', userUuid)
      .single()
    userReaction = reaction?.type ?? null
  }

  return NextResponse.json({ thread: { ...thread, user_reaction: userReaction } })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { ownerToken, action } = body // action: 'close' | 'delete'

  if (!ownerToken) {
    return NextResponse.json({ error: 'Token tidak valid' }, { status: 403 })
  }

  const tokenHash = hashOwnerToken(ownerToken)
  const supabase = createServiceClient()

  const { data: thread } = await supabase
    .from('threads')
    .select('owner_token_hash')
    .eq('id', id)
    .single()

  if (!thread || thread.owner_token_hash !== tokenHash) {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 })
  }

  const status = action === 'delete' ? 'removed' : 'closed'
  await supabase.from('threads').update({ status }).eq('id', id)

  return NextResponse.json({ ok: true })
}
