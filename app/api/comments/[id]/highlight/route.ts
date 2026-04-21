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

  // Verify the comment exists and get its thread
  const { data: comment } = await supabase
    .from('comments')
    .select('thread_id, is_highlighted')
    .eq('id', id)
    .single()

  if (!comment) return NextResponse.json({ error: 'Komentar tidak ditemukan' }, { status: 404 })

  // Verify the owner token belongs to this thread
  const { data: thread } = await supabase
    .from('threads')
    .select('owner_token_hash')
    .eq('id', comment.thread_id)
    .single()

  if (!thread || thread.owner_token_hash !== tokenHash) {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 })
  }

  // Toggling: if already highlighted → remove highlight; if not → highlight exclusively
  const newHighlighted = !comment.is_highlighted

  if (newHighlighted) {
    // Clear any existing highlight in this thread first (only one allowed)
    await supabase
      .from('comments')
      .update({ is_highlighted: false })
      .eq('thread_id', comment.thread_id)
      .eq('is_highlighted', true)
  }

  // Apply the new state to the target comment
  const { error } = await supabase
    .from('comments')
    .update({ is_highlighted: newHighlighted })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ is_highlighted: newHighlighted })
}
