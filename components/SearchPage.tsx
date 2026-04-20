'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ThreadCard } from './ThreadCard'
import type { Thread } from '@/types'
import { Search, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Thread[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = useCallback(async (q: string) => {
    if (q.length < 2) return
    setLoading(true)
    setSearched(true)
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    setResults(data.threads ?? [])
    setLoading(false)
  }, [])

  const handleReact = useCallback(async (threadId: string, type: 'up' | 'down') => {
    const res = await fetch(`/api/threads/${threadId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
    if (!res.ok) { toast.error('Gagal memberi reaksi'); return }
    const { reaction } = await res.json()
    setResults((prev) =>
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
          updated.user_reaction = reaction
        }
        return updated
      })
    )
  }, [])

  return (
    <div className="pb-20">
      {/* Search header */}
      <div className="sticky top-12 z-30 bg-zinc-950 border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-zinc-500 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1 flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 focus-within:border-zinc-500 transition-colors">
            <Search className="w-4 h-4 text-zinc-600 flex-shrink-0" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="Cari thread..."
              autoFocus
              className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none"
            />
          </div>
          <button
            onClick={() => handleSearch(query)}
            className="text-sm font-medium text-white bg-zinc-800 px-3 py-2 rounded-xl hover:bg-zinc-700 transition-colors"
          >
            Cari
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse" />
          ))
        ) : searched && results.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm">Tidak ada hasil untuk &ldquo;{query}&rdquo;</p>
          </div>
        ) : !searched ? (
          <div className="text-center py-16 text-zinc-700">
            <p className="text-4xl mb-3">💭</p>
            <p className="text-sm">Ketik sesuatu untuk mencari thread</p>
          </div>
        ) : (
          results.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} onReact={handleReact} />
          ))
        )}
      </div>
    </div>
  )
}
