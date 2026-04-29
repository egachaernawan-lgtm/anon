'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { formatDistanceToNow } from '@/lib/time'
import { ReactionBar } from './ReactionBar'
import { StoryCard } from './StoryCard'
import { shareAsStory } from '@/lib/shareStory'
import { getCategoryColor } from '@/lib/categoryColors'
import type { Thread } from '@/types'
import { toast } from 'sonner'
import { MessageSquare, Eye, Share2 } from 'lucide-react'

interface Props {
  thread: Thread
  onReact?: (threadId: string, type: 'up' | 'down') => void
}

// Exact path from design SVG (viewBox 0 0 944 486)
const CARD_PATH = 'M24 0.5H289.001C298.732 0.500151 307.457 6.49802 310.942 15.584L333.033 73.1787L333.156 73.5H920C932.979 73.5 943.5 84.0213 943.5 97V462C943.5 474.979 932.979 485.5 920 485.5H24C11.0213 485.5 0.5 474.979 0.5 462V24C0.5 11.0213 11.0213 0.500001 24 0.5Z'

// Tab height ratio from design: y=73.5 out of viewBox height 486
const TAB_RATIO = 73.5 / 486

export function ThreadCard({ thread, onReact }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const storyRef   = useRef<HTMLDivElement>(null)
  const [tabH, setTabH] = useState(38)

  const color = getCategoryColor(thread.subcategory_id)
  const slug  = (thread.subcategory as unknown as { slug: string })?.slug ?? ''

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const ro = new ResizeObserver(() => {
      const h = wrapper.offsetHeight
      if (h > 0) setTabH(Math.round(h * TAB_RATIO))
    })
    ro.observe(wrapper)
    return () => ro.disconnect()
  }, [])

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/thread/${thread.id}`
    if (!storyRef.current) return
    const result = await shareAsStory(storyRef.current, url, thread.title)
    if (result === 'copied') toast.success('Link disalin!')
  }, [thread])

  return (
    <>
      {typeof window !== 'undefined' && createPortal(
        <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', zIndex: -1 }}>
          <div ref={storyRef}><StoryCard thread={thread} /></div>
        </div>,
        document.body
      )}

      <div ref={wrapperRef} className="mb-3" style={{ position: 'relative' }}>

        {/* SVG card background — exact design path, stretches to fill */}
        <svg
          aria-hidden
          viewBox="0 0 944 486"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <path
            d={CARD_PATH}
            style={{ fill: 'var(--brand-surface)', stroke: 'var(--brand-border)' }}
            strokeWidth="1"
          />
        </svg>

        {/* Content (on top of SVG) */}
        <div style={{ position: 'relative' }}>

          {/* Header row: tab label (left) + mask · time (right) */}
          <div style={{ display: 'flex', alignItems: 'flex-end', height: tabH }}>

            {/* Folder tab label — Geist Mono per design QA */}
            <Link
              href={`/${slug}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: tabH,
                paddingLeft: 14,
                paddingRight: 14,
                fontFamily: 'var(--font-geist-mono)',
                fontWeight: 700,
                fontSize: 13,
                color,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              /{slug} &gt;
            </Link>

            <div style={{ flex: 1 }} />

            {/* Mask · time */}
            <span
              style={{
                fontFamily: 'var(--font-geist-mono)',
                fontSize: 12,
                color: 'var(--brand-muted)',
                paddingRight: 16,
                paddingBottom: 6,
                whiteSpace: 'nowrap',
              }}
            >
              {thread.mask_id} · {formatDistanceToNow(thread.created_at)}
            </span>
          </div>

          {/* Thread title + content */}
          <Link href={`/thread/${thread.id}`} className="block px-4 pt-2 pb-3">
            <h3
              className="line-clamp-2"
              style={{
                fontFamily: 'var(--font-geist-mono)',
                fontWeight: 700,
                fontSize: 15,
                lineHeight: 1.4,
                color: 'var(--brand-text)',
                marginBottom: 6,
              }}
            >
              {thread.title}
            </h3>
            <p
              className="line-clamp-3"
              style={{
                fontFamily: 'var(--font-geist-mono)',
                fontSize: 13,
                lineHeight: 1.65,
                color: 'var(--brand-text-soft)',
              }}
            >
              {thread.content}
            </p>
          </Link>

          {/* Stats bar — no top border per design QA */}
          <div className="flex items-center px-3 pb-2.5 gap-1">
            <ReactionBar
              upvotes={thread.upvotes}
              downvotes={thread.downvotes}
              userReaction={thread.user_reaction ?? null}
              onReact={(type) => onReact?.(thread.id, type)}
            />

            <Link
              href={`/thread/${thread.id}`}
              className="flex items-center gap-1.5 px-2 py-1 transition-opacity hover:opacity-70"
              style={{ color: 'var(--brand-muted)', fontSize: 12, fontFamily: 'var(--font-geist-mono)' }}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{thread.comment_count}</span>
            </Link>

            <span
              className="flex items-center gap-1.5 px-2 py-1"
              style={{ color: 'var(--brand-muted)', fontSize: 12, fontFamily: 'var(--font-geist-mono)' }}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{thread.view_count ?? 0}</span>
            </span>

            <button
              onClick={handleShare}
              className="flex items-center px-2 py-1 ml-auto transition-opacity hover:opacity-70"
              style={{ color: 'var(--brand-muted)' }}
              aria-label="Bagikan"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
