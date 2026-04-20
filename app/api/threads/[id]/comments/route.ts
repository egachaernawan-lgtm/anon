import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { getMaskIdSync } from '@/lib/mask'
import { moderateContent } from '@/lib/moderation'
import { getUserUUIDFromCookie } from '@/lib/user'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieHeader = request.headers.get('cookie') ?? ''
  const userUuid = getUserUUIDFromCookie(cookieHeader)

  const supabase = createServiceClient()

  // Fetch top-level comments
  const { data: comments, error } = await supabase
    .from('comments')
    .select('*')
    .eq('thread_id', id)
    .is('parent_id', null)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch replies for all top-level comments
  const commentIds = (comments ?? []).map((c) => c.id)
  const { data: replies } = await supabase
    .from('comments')
    .select('*')
    .in('parent_id', commentIds.length > 0 ? commentIds : ['none'])
    .order('created_at', { ascending: true })

  // Fetch user reactions if logged in
  let userReactions: Record<string, 'up' | 'down'> = {}
  if (userUuid && commentIds.length > 0) {
    const allIds = [...commentIds, ...(replies ?? []).map((r) => r.id)]
    const { data: reactions } = await supabase
      .from('comment_reactions')
      .select('comment_id, type')
      .in('comment_id', allIds)
      .eq('user_uuid', userUuid)

    userReactions = Object.fromEntries(
      (reactions ?? []).map((r) => [r.comment_id, r.type])
    )
  }

  const replyMap = new Map<string, typeof replies>()
  for (const reply of replies ?? []) {
    const list = replyMap.get(reply.parent_id) ?? []
    list.push({ ...reply, user_reaction: userReactions[reply.id] ?? null })
    replyMap.set(reply.parent_id, list)
  }

  const nested = (comments ?? []).map((c) => ({
    ...c,
    user_reaction: userReactions[c.id] ?? null,
    replies: replyMap.get(c.id) ?? [],
  }))

  return NextResponse.json({ comments: nested })
}

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

  const body = await request.json()
  const { content, parent_id } = body

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Komentar tidak boleh kosong' }, { status: 400 })
  }

  const maxLen = parent_id ? 300 : 500
  if (content.length > maxLen) {
    return NextResponse.json(
      { error: `Komentar maksimal ${maxLen} karakter` },
      { status: 400 }
    )
  }

  // Check thread exists and is open
  const supabase = createServiceClient()
  const { data: thread } = await supabase
    .from('threads')
    .select('status')
    .eq('id', id)
    .single()

  if (!thread) return NextResponse.json({ error: 'Thread tidak ditemukan' }, { status: 404 })
  if (thread.status !== 'open') {
    return NextResponse.json({ error: 'Thread sudah ditutup' }, { status: 403 })
  }

  // AI moderation
  const modResult = await moderateContent(content)
  if (modResult.blocked) {
    return NextResponse.json(
      { error: 'Komentar tidak dapat diposting karena melanggar aturan komunitas.' },
      { status: 422 }
    )
  }

  const maskId = getMaskIdSync(id, userUuid)

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      thread_id: id,
      parent_id: parent_id ?? null,
      author_uuid: userUuid,
      mask_id: maskId,
      content: modResult.maskedContent,
      is_ai_flagged: !modResult.safe,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Increment comment_count
  await supabase.rpc('increment_comment_count', { thread_id: id })

  return NextResponse.json(
    { comment, warningMessage: modResult.warningMessage },
    { status: 201 }
  )
}
