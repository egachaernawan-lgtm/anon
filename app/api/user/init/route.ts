import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const { uuid } = await request.json()

  if (!uuid || typeof uuid !== 'string') {
    return NextResponse.json({ error: 'UUID required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  await supabase.from('users').upsert(
    { id: uuid, last_seen: new Date().toISOString() },
    { onConflict: 'id', ignoreDuplicates: false }
  )

  return NextResponse.json({ ok: true })
}
