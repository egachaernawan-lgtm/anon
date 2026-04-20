import { ThreadDetail } from '@/components/ThreadDetail'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return { title: `Thread — Anon`, description: `Diskusi anonim di Anon — ${id}` }
}

export default async function ThreadPage({ params }: Props) {
  const { id } = await params
  return <ThreadDetail threadId={id} />
}
