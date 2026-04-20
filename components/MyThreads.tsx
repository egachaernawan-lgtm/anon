'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getLocalThreads, updateLastChecked, type LocalThreadEntry } from '@/lib/user'
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

    // Fetch current comment counts
    const ids = local.map((t) => t.threadId)
    Promise.all(
      ids.map((id) =>
        fetch(`/api/threads/${id}`)
          .then((r) => r.ok ? r.json() : null)
          .catch(() => null)
      )
    ).then((results) => {
      const enriched = local.map((t, i) => {
        const current = results[i]?.thread?.comment_count ?? t.lastCheckedCommentCount ?? 0
        const newComments = Math.max(0, current - (t.lastCheckedCommentCount ?? 0))
        return { ...t, currentCount: current, newComments }
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
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-zinc-500 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-base font-bold text-white">Threads Saya</h1>
      </div>

      <p className="text-xs text-zinc-600 mb-5">
        Thread yang kamu buat disimpan di perangkat ini. Bersihkan browser untuk menghapus riwayat.
      </p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">Belum ada thread yang kamu buat.</p>
          <Link href="/buat" className="mt-4 inline-block text-xs text-white bg-zinc-800 px-4 py-2 rounded-full hover:bg-zinc-700">
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
              className="block bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white line-clamp-2">{thread.title}</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    {thread.subcategorySlug ? `/${thread.subcategorySlug} · ` : ''}
                    {formatDistanceToNow(thread.createdAt)}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-700 flex-shrink-0 mt-0.5" />
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span className="flex items-center gap-1 text-xs text-zinc-500">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {thread.currentCount ?? 0} komentar
                </span>
                {(thread.newComments ?? 0) > 0 && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
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
