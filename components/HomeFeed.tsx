'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ThreadCard } from './ThreadCard'
import { CATEGORIES } from '@/lib/categories'
import type { Thread } from '@/types'
import { PenSquare, ChevronRight } from 'lucide-react'
import { getOrCreateUserUUID } from '@/lib/user'
import { toast } from 'sonner'

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
    if (!res.ok) {
      toast.error('Gagal memberi reaksi')
      return
    }
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
      <div className="p-4 space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-4 bg-zinc-800 rounded w-24 animate-pulse" />
            <div className="h-28 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="pb-24">
      {CATEGORIES.map((cat) =>
        cat.subcategories?.map((sub) => {
          const thread = feed[sub.id] as Thread | undefined
          if (!thread) return null
          return (
            <section key={sub.id} className="px-4 pt-5">
              <div className="flex items-center justify-between mb-2">
                <Link
                  href={`/${sub.slug}`}
                  className="flex items-center gap-1 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  <span className="text-xs text-zinc-600">/{sub.slug}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
                </Link>
                <Link
                  href={`/buat?sub=${sub.id}&subSlug=${sub.slug}`}
                  className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  <PenSquare className="w-3.5 h-3.5" />
                  <span>Buat</span>
                </Link>
              </div>
              <ThreadCard thread={thread} onReact={handleReact} />
            </section>
          )
        })
      )}
    </div>
  )
}
