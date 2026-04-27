'use client'

import { useRef, useCallback } from 'react'
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

// Tab height and diagonal slant dimensions (matches SVG proportions)
const TAB_H = 36   // px — height of the raised tab
const SLANT_W = 20 // px — horizontal width of the diagonal connector

export function ThreadCard({ thread, onReact }: Props) {
  const storyRef = useRef<HTMLDivElement>(null)
  const color = getCategoryColor(thread.subcategory_id)
  const slug = (thread.subcategory as unknown as { slug: string })?.slug ?? ''

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

      {/* Outer wrapper reserves space for the tab above the card body */}
      <div className="mb-3" style={{ paddingTop: `${TAB_H}px`, position: 'relative' }}>

        {/* ── Tab + diagonal, absolutely positioned above the card body ── */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'stretch',
            pointerEvents: 'none',
          }}
        >
          {/* Tab rectangle */}
          <Link
            href={`/${slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: `${TAB_H}px`,
              padding: '0 14px',
              backgroundColor: '#FFFBF1',
              borderTop: '1.5px solid #DCCAB4',
              borderLeft: '1.5px solid #DCCAB4',
              borderRadius: '10px 0 0 0',
              fontFamily: 'var(--font-space-mono)',
              fontWeight: 700,
              fontSize: '13px',
              color,
              pointerEvents: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            /{slug} &gt;
          </Link>

          {/* Diagonal connector — inline SVG for pixel-perfect diagonal */}
          <svg
            width={SLANT_W}
            height={TAB_H}
            viewBox={`0 0 ${SLANT_W} ${TAB_H}`}
            style={{ display: 'block', flexShrink: 0 }}
          >
            {/* Fill the lower-left triangle (below hypotenuse) with card background */}
            <polygon
              points={`0,0 0,${TAB_H} ${SLANT_W},${TAB_H}`}
              fill="#FFFBF1"
            />
            {/* Draw the hypotenuse border line */}
            <line
              x1={0} y1={0}
              x2={SLANT_W} y2={TAB_H}
              stroke="#DCCAB4"
              strokeWidth={1.5}
            />
          </svg>

          {/* Top border line for the card body, from slant end to right edge */}
          <div style={{
            flex: 1,
            alignSelf: 'flex-end',
            borderTop: '1.5px solid #DCCAB4',
          }} />
        </div>

        {/* ── Main card body ── */}
        <div
          style={{
            backgroundColor: '#FFFBF1',
            border: '1.5px solid #DCCAB4',
            borderTop: 'none', // top border is drawn by the tab row above
            borderRadius: '0 12px 12px 12px',
          }}
        >
          {/* Header row: mask ID + time */}
          <div
            className="flex items-center justify-between px-4 pt-3"
            style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '12px', color: '#C0A280' }}
          >
            <span>{thread.mask_id}</span>
            <span>{formatDistanceToNow(thread.created_at)}</span>
          </div>

          {/* Title + content — clickable to thread detail */}
          <Link href={`/thread/${thread.id}`} className="block px-4 pt-2 pb-3">
            <h3
              className="line-clamp-2 mb-2"
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontWeight: 700,
                fontSize: '15px',
                lineHeight: 1.4,
                color: '#191919',
              }}
            >
              {thread.title}
            </h3>
            <p
              className="line-clamp-3"
              style={{
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '13px',
                lineHeight: 1.65,
                color: '#6B5B45',
              }}
            >
              {thread.content}
            </p>
          </Link>

          {/* Stats bar */}
          <div
            className="flex items-center px-3 py-2.5 gap-1"
            style={{ borderTop: '1px solid #DCCAB4' }}
          >
            <ReactionBar
              upvotes={thread.upvotes}
              downvotes={thread.downvotes}
              userReaction={thread.user_reaction ?? null}
              onReact={(type) => onReact?.(thread.id, type)}
            />

            <Link
              href={`/thread/${thread.id}`}
              className="flex items-center gap-1.5 px-2 py-1 transition-opacity hover:opacity-70"
              style={{ color: '#C0A280', fontSize: '12px', fontFamily: 'var(--font-geist-mono)' }}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{thread.comment_count}</span>
            </Link>

            <span
              className="flex items-center gap-1.5 px-2 py-1"
              style={{ color: '#C0A280', fontSize: '12px', fontFamily: 'var(--font-geist-mono)' }}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{thread.view_count ?? 0}</span>
            </span>

            <button
              onClick={handleShare}
              className="flex items-center px-2 py-1 ml-auto transition-opacity hover:opacity-70"
              style={{ color: '#C0A280' }}
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
