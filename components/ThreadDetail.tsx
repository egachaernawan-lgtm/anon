'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { CommentItem } from './CommentItem'
import { ReactionBar } from './ReactionBar'
import { StoryCard } from './StoryCard'
import { shareAsStory } from '@/lib/shareStory'
import type { Thread, Comment } from '@/types'
import { ArrowLeft, Lock, Trash2 } from 'lucide-react'
import { getCategoryColor } from '@/lib/categoryColors'
import { formatDistanceToNow } from '@/lib/time'
import { getOrCreateUserUUID, getOwnerToken } from '@/lib/user'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'

interface Props {
  threadId: string
}

export function ThreadDetail({ threadId }: Props) {
  const [thread, setThread] = useState<Thread | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState<{ id: string; mask: string } | null>(null)
  const [posting, setPosting] = useState(false)
  const [ownerToken, setOwnerToken] = useState<string | null>(null)
  const [userUuid, setUserUuid] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const storyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const uuid = getOrCreateUserUUID()
    setUserUuid(uuid)
    setOwnerToken(getOwnerToken(threadId))
  }, [threadId])

  const loadData = useCallback(async () => {
    const [threadRes, commentsRes] = await Promise.all([
      fetch(`/api/threads/${threadId}`),
      fetch(`/api/threads/${threadId}/comments`),
    ])
    if (!threadRes.ok) { setLoading(false); return }
    const { thread } = await threadRes.json()
    const { comments } = await commentsRes.json()
    setThread(thread)
    setComments(comments ?? [])
    setLoading(false)
  }, [threadId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Supabase real-time subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`thread-${threadId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `thread_id=eq.${threadId}` },
        (payload) => {
          const newComment = payload.new as Comment
          if (newComment.parent_id) {
            setComments((prev) =>
              prev.map((c) =>
                c.id === newComment.parent_id
                  ? { ...c, replies: [...(c.replies ?? []), newComment] }
                  : c
              )
            )
          } else {
            setComments((prev) => {
              if (prev.find((c) => c.id === newComment.id)) return prev
              return [...prev, { ...newComment, replies: [] }]
            })
          }
          setThread((t) => t ? { ...t, comment_count: t.comment_count + 1 } : t)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'threads', filter: `id=eq.${threadId}` },
        (payload) => {
          setThread((prev) => prev ? { ...prev, ...payload.new } : prev)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [threadId])

  const handleReact = useCallback(async (type: 'up' | 'down') => {
    const res = await fetch(`/api/threads/${threadId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
    if (!res.ok) return
    const { reaction } = await res.json()
    setThread((t) => {
      if (!t) return t
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
  }, [threadId])

  const handleCommentReact = useCallback(async (commentId: string, type: 'up' | 'down') => {
    const res = await fetch(`/api/comments/${commentId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
    if (!res.ok) return
    const { reaction } = await res.json()

    const updateComment = (c: Comment): Comment => {
      if (c.id !== commentId) return { ...c, replies: c.replies?.map(updateComment) }
      const updated = { ...c }
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
    }
    setComments((prev) => prev.map(updateComment))
  }, [])

  const handleHighlight = useCallback(async (commentId: string) => {
    if (!ownerToken) return
    const res = await fetch(`/api/comments/${commentId}/highlight`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerToken }),
    })
    if (!res.ok) return
    const { is_highlighted } = await res.json()

    setComments((prev) =>
      prev.map((c) => {
        // If we just highlighted a new comment, clear all others first
        const clearOthers = is_highlighted && c.id !== commentId
        return {
          ...c,
          is_highlighted: c.id === commentId ? is_highlighted : clearOthers ? false : c.is_highlighted,
          replies: c.replies?.map((r) => ({
            ...r,
            is_highlighted: r.id === commentId ? is_highlighted : is_highlighted ? false : r.is_highlighted,
          })),
        }
      })
    )
  }, [ownerToken])

  const handlePost = useCallback(async () => {
    if (!commentText.trim() || posting) return
    setPosting(true)
    const res = await fetch(`/api/threads/${threadId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: commentText, parent_id: replyTo?.id ?? null }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Gagal memposting komentar')
      setPosting(false)
      return
    }
    if (data.warningMessage) toast.warning(data.warningMessage)

    // Add comment to state immediately — don't wait for Realtime
    const newComment = { ...data.comment, replies: [], user_reaction: null }
    if (replyTo?.id) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === replyTo.id
            ? { ...c, replies: [...(c.replies ?? []), newComment] }
            : c
        )
      )
    } else {
      setComments((prev) => [...prev, newComment])
    }
    setThread((t) => t ? { ...t, comment_count: t.comment_count + 1 } : t)

    setCommentText('')
    setReplyTo(null)
    setPosting(false)
  }, [commentText, posting, replyTo, threadId])

  const handleThreadAction = async (action: 'close' | 'delete') => {
    if (!ownerToken) return
    const label = action === 'close' ? 'menutup' : 'menghapus'
    if (!confirm(`Yakin ingin ${label} thread ini?`)) return
    const res = await fetch(`/api/threads/${threadId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerToken, action }),
    })
    if (!res.ok) { toast.error('Gagal'); return }
    toast.success(action === 'close' ? 'Thread ditutup' : 'Thread dihapus')
    setThread((t) => t ? { ...t, status: action === 'close' ? 'closed' : 'removed' } : t)
  }

  const handleShare = async () => {
    const url = window.location.href
    if (!storyRef.current || !thread) return
    const result = await shareAsStory(storyRef.current, url, thread.title)
    if (result === 'copied') toast.success('Link disalin!')
  }

  if (loading) {
    return (
      <div className="px-4 pt-4 space-y-4 animate-pulse">
        <div className="h-5 bg-zinc-800 rounded w-3/4" />
        <div className="h-20 bg-zinc-900 rounded-xl border border-zinc-800" />
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="text-center py-20 text-zinc-600">
        <p className="text-4xl mb-3">🚫</p>
        <p>Thread tidak ditemukan</p>
      </div>
    )
  }

  const isOwner = !!ownerToken
  const isClosed = thread.status !== 'open'
  const subcategorySlug = (thread.subcategory as unknown as { slug: string })?.slug
  const categoryColor = getCategoryColor(thread.subcategory_id)

  return (
    <>
    {/* Off-screen story card for image capture */}
    {typeof window !== 'undefined' && createPortal(
      <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', zIndex: -1 }}>
        <div ref={storyRef}>
          <StoryCard thread={thread} />
        </div>
      </div>,
      document.body
    )}

    <div className="pb-32">
      {/* Back nav */}
      <div className="sticky top-12 z-30 brand-bg/95 backdrop-blur border-b brand-border px-4 py-2 flex items-center gap-3">
        <Link href={subcategorySlug ? `/${subcategorySlug}` : '/'} className="brand-muted hover:brand-text transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span
          className="text-xs font-mono font-bold flex-1"
          style={{ color: categoryColor }}
        >
          &lt;/{subcategorySlug ?? 'anon'}&gt;
        </span>
        <button onClick={handleShare} className="brand-muted hover:brand-text transition-colors font-mono text-sm">
          ↗
        </button>
      </div>

      {/* Thread content */}
      <div className="px-4 pt-4">
        {isClosed && (
          <div className="flex items-center gap-2 text-xs font-mono brand-muted brand-surface rounded px-3 py-2 mb-3 border brand-border">
            <Lock className="w-3.5 h-3.5" />
            Thread ini sudah ditutup
          </div>
        )}

        <h1
          className="text-base font-bold brand-text leading-snug mb-2"
          style={{ fontFamily: 'var(--font-space-mono)' }}
        >
          {thread.title}
        </h1>
        <p className="text-xs font-mono brand-muted mb-3">
          {thread.mask_id}
          {isOwner && (
            <span className="ml-1.5 text-xs font-bold" style={{ color: 'var(--green)' }}>[Pembuat]</span>
          )}
          {' · '}{formatDistanceToNow(thread.created_at)}
        </p>
        <p className="text-sm font-mono brand-text-soft leading-relaxed whitespace-pre-wrap">{thread.content}</p>

        <div className="flex items-center gap-2 mt-4 pt-3 border-t brand-border">
          <ReactionBar
            upvotes={thread.upvotes}
            downvotes={thread.downvotes}
            userReaction={thread.user_reaction ?? null}
            onReact={handleReact}
            size="md"
          />
          <span className="flex items-center gap-1 text-xs font-mono brand-muted ml-1">
            □ {thread.comment_count}
          </span>
          {isOwner && (
            <div className="ml-auto flex gap-2">
              {!isClosed && (
                <button
                  onClick={() => handleThreadAction('close')}
                  className="text-xs font-mono brand-muted hover:brand-text flex items-center gap-1 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => handleThreadAction('delete')}
                className="text-xs font-mono flex items-center gap-1 transition-colors"
                style={{ color: 'var(--red)' }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="px-4 pt-4">
        <h2 className="text-xs font-mono font-bold brand-muted uppercase tracking-wider mb-3">
          KOMENTAR
        </h2>

        {comments.length === 0 ? (
          <p className="text-center text-sm font-mono brand-muted py-8">
            Belum ada komentar. Jadilah yang pertama!
          </p>
        ) : (
          <div className="space-y-2">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isOwner={isOwner}
                threadId={threadId}
                ownerToken={ownerToken}
                userUuid={userUuid}
                onHighlight={handleHighlight}
                onReact={handleCommentReact}
                onReply={(id, mask) => {
                  setReplyTo({ id, mask })
                  textareaRef.current?.focus()
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Comment input bar */}
      {!isClosed && (
        <div className="fixed bottom-0 left-0 right-0 brand-bg border-t brand-border px-4 pt-3 pb-safe">
          <div className="max-w-lg mx-auto">
            {replyTo && (
              <div className="flex items-center justify-between text-xs font-mono brand-muted mb-2 brand-surface rounded px-3 py-2 border brand-border">
                <span>Membalas <strong className="brand-text">{replyTo.mask}</strong></span>
                <button onClick={() => setReplyTo(null)} className="brand-muted hover:brand-text">✕</button>
              </div>
            )}
            <div className="flex gap-2">
              <textarea
                ref={textareaRef}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={replyTo ? `Balas ${replyTo.mask}...` : 'Tulis komentar...'}
                maxLength={replyTo ? 300 : 500}
                rows={2}
                className="flex-1 brand-surface border brand-border rounded px-3 py-2 text-sm font-mono brand-text placeholder:brand-muted resize-none focus:outline-none transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handlePost()
                  }
                }}
              />
              <button
                onClick={handlePost}
                disabled={!commentText.trim() || posting}
                className="text-sm font-mono font-bold px-4 rounded disabled:opacity-30 transition-colors"
                style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
              >
                {posting ? '...' : 'Kirim'}
              </button>
            </div>
            <p className="text-xs font-mono brand-muted mt-1 text-right">
              {commentText.length}/{replyTo ? 300 : 500}
            </p>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
