import { MyThreads } from '@/components/MyThreads'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Threads Saya — Anon',
}

export default function ThreadsSayaPage() {
  return <MyThreads />
}
