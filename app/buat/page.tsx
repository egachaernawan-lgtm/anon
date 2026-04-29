import { Suspense } from 'react'
import { CreateThreadForm } from '@/components/CreateThreadForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Buat Thread — YAPPR',
}

export default function BuatPage() {
  return (
    <Suspense>
      <CreateThreadForm />
    </Suspense>
  )
}
