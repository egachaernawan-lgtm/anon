import { SearchPage } from '@/components/SearchPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cari — YAPPR',
}

export default function CariPage() {
  return <SearchPage />
}
