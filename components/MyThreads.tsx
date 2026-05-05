'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getLocalThreads, updateLastChecked, removeLocalThread, type LocalThreadEntry } from '@/lib/user'
import { formatDistanceToNow } from '@/lib/time'
import { MessageSquare, ArrowLeft, ExternalLink } from 'lucide-react'

interface ThreadWithCount extends LocalThreadEntry {
  currentCount?: number
  newComments?: number
}

export function MyThreads() {
  const [threads, setThreads] = useState<ThreadWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const local = getLocalThreads()
    if (local.length === 0) { setLoading(false); return }

    const ids = local.map((t) => t.threadId)
    Promise.all(
      ids.map((id) =>
        fetch(`/api/threads/${id}`)
          .then((r) => r.ok ? r.json() : null)
          .catch(() => null)
      )
    ).then((results) => {
      const enriched: ThreadWithCount[] = []

      local.forEach((t, i) => {
        const result = results[i]

        // API returns 404 (null) when thread is deleted or removed — purge from localStorage
        if (!result || !result.thread) {
          removeLocalThread(t.threadId)
          return
        }

        const current = result.thread.comment_count ?? t.lastCheckedCommentCount ?? 0
        const newComments = Math.max(0, current - (t.lastCheckedCommentCount ?? 0))
        enriched.push({ ...t, currentCount: current, newComments })
      })

      setThreads(enriched)
      setLoading(false)
    })
  }, [])

  const handleVisit = (threadId: string, currentCount: number) => {
    updateLastChecked(threadId, currentCount)
    setThreads((prev) =>
      prev.map((t) => t.threadId === threadId ? { ...t, newComments: 0, lastCheckedCommentCount: currentCount } : t)
    )
  }

  return (
    <div className="px-4 pt-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="brand-muted hover:brand-text transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1
          className="text-base font-bold brand-text"
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          Threads Saya
        </h1>
      </div>

      {/* PSA — #C0A280 both themes */}
      <p
        className="text-xs mb-5"
        style={{ fontFamily: 'var(--font-geist-mono)', color: '#C0A280' }}
      >
        Thread yang kamu buat disimpan di perangkat ini. Bersihkan browser untuk menghapus riwayat.
      </p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl border animate-pulse"
              style={{ backgroundColor: 'var(--mythread-card-bg)', borderColor: 'var(--mythread-card-border)' }}
            />
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--brand-muted)' }}>
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm" style={{ fontFamily: 'var(--font-geist-mono)' }}>Belum ada thread yang kamu buat.</p>
          <Link
            href="/buat"
            className="mt-4 inline-block text-xs px-4 py-2 rounded-full"
            style={{
              fontFamily: 'var(--font-geist-mono)',
              backgroundColor: 'var(--btn-kirim-bg)',
              color: 'var(--btn-kirim-text)',
              border: '1.5px solid var(--btn-kirim-border)',
            }}
          >
            Buat Thread Pertama
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {threads.map((thread) => (
            <Link
              key={thread.threadId}
              href={`/thread/${thread.threadId}`}
              onClick={() => handleVisit(thread.threadId, thread.currentCount ?? 0)}
              className="block rounded-xl border p-4 transition-opacity hover:opacity-80"
              style={{
                backgroundColor: 'var(--mythread-card-bg)',
                borderColor: 'var(--mythread-card-border)',
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold line-clamp-2"
                    style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--brand-text)' }}
                  >
                    {thread.title}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ fontFamily: 'var(--font-geist-mono)', color: '#C0A280' }}
                  >
                    {thread.subcategorySlug ? `/${thread.subcategorySlug} · ` : ''}
                    {formatDistanceToNow(thread.createdAt)}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#C0A280' }} />
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span
                  className="flex items-center gap-1 text-xs"
                  style={{ fontFamily: 'var(--font-geist-mono)', color: '#C0A280' }}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  {thread.currentCount ?? 0} komentar
                </span>
                {(thread.newComments ?? 0) > 0 && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      fontFamily: 'var(--font-geist-mono)',
                      backgroundColor: 'rgba(85,173,136,0.2)',
                      color: 'var(--brand-green)',
                    }}
                  >
                    +{thread.newComments} baru
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
