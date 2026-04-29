'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ThreadCard } from './ThreadCard'
import type { Thread } from '@/types'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { findSubcategoryBySlug } from '@/lib/categories'

interface Props {
  subcategoryId: number
  subcategorySlug: string
  subcategoryName: string
  categoryName: string
}

export function SubcategoryFeed({ subcategoryId, subcategorySlug, subcategoryName }: Props) {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const loaderRef = useRef<HTMLDivElement>(null)

  const loadThreads = useCallback(async (pageNum: number) => {
    const res = await fetch(`/api/threads?subcategory_id=${subcategoryId}&page=${pageNum}`)
    const data = await res.json()
    const newThreads: Thread[] = data.threads ?? []
    if (pageNum === 1) {
      setThreads(newThreads)
    } else {
      setThreads((prev) => [...prev, ...newThreads])
    }
    setHasMore(newThreads.length === 20)
    setLoading(false)
  }, [subcategoryId])

  useEffect(() => {
    loadThreads(1)
  }, [loadThreads])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const next = page + 1
          setPage(next)
          loadThreads(next)
        }
      },
      { threshold: 0.5 }
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, page, loadThreads])

  const handleReact = useCallback(async (threadId: string, type: 'up' | 'down') => {
    const res = await fetch(`/api/threads/${threadId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
    if (!res.ok) { toast.error('Gagal memberi reaksi'); return }
    const { reaction } = await res.json()

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
          updated.user_reaction = reaction
        }
        return updated
      })
    )
  }, [])

  const found = findSubcategoryBySlug(subcategorySlug)

  return (
    <div className="pb-24">
      {/* Subcategory header — always #C0A280 background */}
      <div
        className="sticky top-12 z-30 px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: '#C0A280' }}
      >
        <div className="flex items-center gap-2">
          <Link href="/" style={{ color: '#FFFBF1' }} className="transition-opacity hover:opacity-70">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <p className="text-xs" style={{ color: '#FFFBF1', opacity: 0.75, fontFamily: 'var(--font-geist-mono)' }}>
              {found?.category.name}
            </p>
            <h1
              className="text-sm font-bold"
              style={{ color: '#FFFBF1', fontFamily: 'var(--font-geist-mono)' }}
            >
              {subcategoryName}
            </h1>
          </div>
        </div>

        {/* FAB-style write button — same as homepage */}
        <Link
          href={`/buat?sub=${subcategoryId}&subSlug=${subcategorySlug}`}
          className="transition-transform active:scale-95"
          aria-label="Buat thread baru"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fab-dark.svg" alt="Buat thread" width={48} height={48} />
        </Link>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {loading && threads.length === 0 ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl border animate-pulse"
              style={{ backgroundColor: 'var(--brand-surface)', borderColor: 'var(--brand-border)' }}
            />
          ))
        ) : threads.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--brand-muted)' }}>
            <p className="text-4xl mb-3">💬</p>
            <p className="text-sm" style={{ fontFamily: 'var(--font-geist-mono)' }}>Belum ada thread di sini.</p>
            <p className="text-xs mt-1" style={{ fontFamily: 'var(--font-geist-mono)' }}>Jadilah yang pertama!</p>
          </div>
        ) : (
          threads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} onReact={handleReact} />
          ))
        )}

        {hasMore && <div ref={loaderRef} className="h-8" />}

        {!hasMore && threads.length > 0 && (
          <p
            className="text-center text-xs py-4"
            style={{ color: 'var(--brand-muted)', fontFamily: 'var(--font-geist-mono)' }}
          >
            Semua thread sudah dimuat
          </p>
        )}
      </div>
    </div>
  )
}
