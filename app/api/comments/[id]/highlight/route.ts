import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { hashOwnerToken } from '@/lib/mask'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { ownerToken } = await request.json()

  if (!ownerToken) {
    return NextResponse.json({ error: 'Token tidak valid' }, { status: 403 })
  }

  const tokenHash = hashOwnerToken(ownerToken)
  const supabase = createServiceClient()

  // Verify the owner token belongs to the thread this comment is in
  const { data: comment } = await supabase
    .from('comments')
    .select('thread_id, is_highlighted')
    .eq('id', id)
    .single()

  if (!comment) return NextResponse.json({ error: 'Komentar tidak ditemukan' }, { status: 404 })

  const { data: thread } = await supabase
    .from('threads')
    .select('owner_token_hash')
    .eq('id', comment.thread_id)
    .single()

  if (!thread || thread.owner_token_hash !== tokenHash) {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 })
  }

  const { error } = await supabase
    .from('comments')
    .update({ is_highlighted: !comment.is_highlighted })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ is_highlighted: !comment.is_highlighted })
}
