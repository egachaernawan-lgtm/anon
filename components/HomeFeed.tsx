'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ThreadCard } from './ThreadCard'
import { CATEGORIES } from '@/lib/categories'
import type { Thread } from '@/types'
import { getOrCreateUserUUID } from '@/lib/user'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'

export function HomeFeed() {
  const [feed, setFeed] = useState<Record<number, Thread>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/home')
      .then((r) => r.json())
      .then((d) => setFeed(d.feed ?? {}))
      .finally(() => setLoading(false))
  }, [])

  const handleReact = useCallback(async (threadId: string, type: 'up' | 'down') => {
    const uuid = getOrCreateUserUUID()
    if (!uuid) return

    const res = await fetch(`/api/threads/${threadId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
    if (!res.ok) { toast.error('Gagal memberi reaksi'); return }
    const { reaction } = await res.json()

    setFeed((prev) => {
      const updated = { ...prev }
      for (const [key, thread] of Object.entries(updated)) {
        if (thread.id === threadId) {
          const t = { ...thread }
          if (t.user_reaction === type) {
            type === 'up' ? t.upvotes-- : t.downvotes--
            t.user_reaction = null
          } else {
            if (t.user_reaction === 'up') t.upvotes--
            if (t.user_reaction === 'down') t.downvotes--
            type === 'up' ? t.upvotes++ : t.downvotes++
            t.user_reaction = reaction
          }
          updated[Number(key)] = t
        }
      }
      return updated
    })
  }, [])

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border h-32 animate-pulse" style={{ backgroundColor: 'var(--brand-surface)', borderColor: 'var(--brand-border)' }} />
        ))}
      </div>
    )
  }

  return (
    <div className="pb-28 px-3 pt-3">
      {CATEGORIES.map((cat) =>
        cat.subcategories?.map((sub) => {
          const thread = feed[sub.id] as Thread | undefined
          if (!thread) return null
          return (
            <section key={sub.id} className="mb-2">
              <ThreadCard thread={thread} onReact={handleReact} />
            </section>
          )
        })
      )}

      {/* Floating action button */}
      <Link
        href="/buat"
        className="fixed bottom-6 right-5 z-40 w-14 h-14 flex items-center justify-center rounded-full shadow-lg transition-transform active:scale-95"
        style={{ backgroundColor: 'var(--brand-green)', color: '#fff' }}
        aria-label="Buat thread baru"
      >
        <Pencil className="w-5 h-5" />
      </Link>
    </div>
  )
}
