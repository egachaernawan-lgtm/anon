import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { getMaskIdSync, hashOwnerToken } from '@/lib/mask'
import { moderateContent } from '@/lib/moderation'
import { getUserUUIDFromCookie } from '@/lib/user'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const subcategoryId = searchParams.get('subcategory_id')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 20
  const offset = (page - 1) * limit

  const supabase = createServiceClient()

  let query = supabase
    .from('threads')
    .select('*, subcategory:subcategories(id, name, slug, category:categories(name, slug, icon))')
    .neq('status', 'removed')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (subcategoryId) {
    query = query.eq('subcategory_id', subcategoryId)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ threads: data })
}

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const userUuid = getUserUUIDFromCookie(cookieHeader)

  if (!userUuid) {
    return NextResponse.json({ error: 'Identitas tidak ditemukan' }, { status: 401 })
  }

  const body = await request.json()
  const { title, content, subcategory_id } = body

  if (!title?.trim() || !content?.trim() || !subcategory_id) {
    return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
  }

  if (title.length > 150) {
    return NextResponse.json({ error: 'Judul maksimal 150 karakter' }, { status: 400 })
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: 'Konten maksimal 2000 karakter' }, { status: 400 })
  }

  // AI moderation
  const [titleMod, contentMod] = await Promise.all([
    moderateContent(title),
    moderateContent(content),
  ])

  if (titleMod.blocked || contentMod.blocked) {
    return NextResponse.json(
      { error: 'Konten tidak dapat diposting karena melanggar aturan komunitas.' },
      { status: 422 }
    )
  }

  const threadId = uuidv4()
  const maskId = getMaskIdSync(threadId, userUuid)
  const ownerToken = uuidv4()
  const ownerTokenHash = hashOwnerToken(ownerToken)

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('threads')
    .insert({
      id: threadId,
      subcategory_id,
      title: titleMod.maskedContent,
      content: contentMod.maskedContent,
      author_uuid: userUuid,
      owner_token_hash: ownerTokenHash,
      mask_id: maskId,
      is_ai_flagged: !titleMod.safe || !contentMod.safe,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const warningMessage = titleMod.warningMessage ?? contentMod.warningMessage

  return NextResponse.json({ thread: data, ownerToken, warningMessage }, { status: 201 })
}
