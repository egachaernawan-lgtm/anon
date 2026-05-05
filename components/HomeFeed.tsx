'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ThreadCard } from './ThreadCard'
import type { Thread } from '@/types'
import { getOrCreateUserUUID } from '@/lib/user'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'

export function HomeFeed() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    fetch('/api/home')
      .then((r) => r.json())
      .then((d) => setThreads(d.threads ?? []))
      .finally(() => setLoading(false))
  }, [])

  const handleReact = useCallback(async (threadId: string, type: 'up' | 'down') => {
    const uuid = getOrCreateUserUUID()
    if (!uuid) return

    // Optimistic update
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t
        const updated = { ...t }
        if (updated.user_reaction === type) {
          type === 'up' ? updated.upvotes-- : updated.downvotes--
          updated.user_reaction = null
        } else {
          if (updated.user_reaction === 'up') updated.upvotes--
          if (updated.user_reaction === 'down') updated.downvotes--
          type === 'up' ? updated.upvotes++ : updated.downvotes++
          updated.user_reaction = type
        }
        return updated
      })
    )

    const res = await fetch(`/api/threads/${threadId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
    if (!res.ok) {
      toast.error('Gagal memberi reaksi')
      // Roll back optimistic update
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== threadId) return t
          const rolled = { ...t }
          if (rolled.user_reaction === type) {
            type === 'up' ? rolled.upvotes-- : rolled.downvotes--
            rolled.user_reaction = null
          } else {
            if (rolled.user_reaction === 'up') rolled.upvotes--
            if (rolled.user_reaction === 'down') rolled.downvotes--
            type === 'up' ? rolled.upvotes++ : rolled.downvotes++
            rolled.user_reaction = type
          }
          return rolled
        })
      )
    }
  }, [])

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-lg border h-32 animate-pulse"
            style={{ backgroundColor: 'var(--brand-surface)', borderColor: 'var(--brand-border)' }}
          />
        ))}
      </div>
    )
  }

  if (threads.length === 0) {
    return (
      <div className="text-center py-24" style={{ color: 'var(--brand-muted)', fontFamily: 'var(--font-geist-mono)' }}>
        <p className="text-4xl mb-3">💬</p>
        <p className="text-sm">Belum ada thread. Jadilah yang pertama!</p>
      </div>
    )
  }

  return (
    <div className="pb-28 px-3 pt-3">
      {threads.map((thread) => (
        <ThreadCard key={thread.id} thread={thread} onReact={handleReact} />
      ))}

      {/* Floating action button */}
      {mounted && (
        <Link
          href="/buat"
          className="fixed bottom-6 right-5 z-40 transition-transform active:scale-95"
          aria-label="Buat thread baru"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolvedTheme === 'dark' ? '/fab-dark.svg' : '/fab-light.svg'}
            alt="Buat thread baru"
            width={64}
            height={64}
          />
        </Link>
      )}
    </div>
  )
}
