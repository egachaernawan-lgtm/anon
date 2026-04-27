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

// Card shape constants (match SVG proportions)
const TAB_H  = 38   // height of the raised folder tab
const SLANT  = 22   // horizontal width of the diagonal slant
const R      = 12   // corner radius

/** Build the folder-card SVG path for given dimensions and tab label width */
function buildPath(w: number, h: number, tabLabelW: number): string {
  const tabEnd = tabLabelW + SLANT
  return [
    `M ${R} 0`,
    `H ${tabLabelW}`,                              // tab top edge
    `L ${tabEnd} ${TAB_H}`,                        // diagonal slant down
    `H ${w - R}`,                                  // body top edge →
    `Q ${w} ${TAB_H} ${w} ${TAB_H + R}`,          // top-right corner
    `V ${h - R}`,                                  // right side ↓
    `Q ${w} ${h} ${w - R} ${h}`,                  // bottom-right corner
    `H ${R}`,                                      // bottom edge ←
    `Q 0 ${h} 0 ${h - R}`,                        // bottom-left corner
    `V ${R}`,                                      // left side ↑
    `Q 0 0 ${R} 0`,                               // top-left corner
    'Z',
  ].join(' ')
}

export function ThreadCard({ thread, onReact }: Props) {
  const wrapperRef  = useRef<HTMLDivElement>(null)
  const tabLabelRef = useRef<HTMLAnchorElement>(null)
  const storyRef    = useRef<HTMLDivElement>(null)

  const [svgPath, setSvgPath] = useState('')

  const color = getCategoryColor(thread.subcategory_id)
  const slug  = (thread.subcategory as unknown as { slug: string })?.slug ?? ''

  // Recompute SVG path whenever card size changes
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const ro = new ResizeObserver(() => {
      const w = wrapper.offsetWidth
      const h = wrapper.offsetHeight
      const tabW = tabLabelRef.current?.offsetWidth ?? 120
      if (w > 0 && h > 0) setSvgPath(buildPath(w, h, tabW))
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

        {/* ── SVG card background (exact folder shape) ── */}
        {svgPath && (
          <svg
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              overflow: 'visible',
            }}
          >
            <path d={svgPath} fill="#FFFBF1" stroke="#DCCAB4" strokeWidth={1.5} />
          </svg>
        )}

        {/* ── Content (on top of SVG) ── */}
        <div style={{ position: 'relative' }}>

          {/* Header row: tab label (left) + mask · time (right, at body level) */}
          <div style={{ display: 'flex', alignItems: 'flex-end', height: TAB_H }}>

            {/* Folder tab label */}
            <Link
              ref={tabLabelRef}
              href={`/${slug}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: TAB_H,
                paddingLeft: 14,
                paddingRight: 14,
                fontFamily: 'var(--font-space-mono)',
                fontWeight: 700,
                fontSize: 13,
                color,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              /{slug} &gt;
            </Link>

            {/* Spacer (covers the diagonal + right gap above body) */}
            <div style={{ flex: 1 }} />

            {/* Mask · time — sits at body-top level (bottom of the TAB_H row) */}
            <span
              style={{
                fontFamily: 'var(--font-geist-mono)',
                fontSize: 12,
                color: '#C0A280',
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
                fontFamily: 'var(--font-space-mono)',
                fontWeight: 700,
                fontSize: 15,
                lineHeight: 1.4,
                color: '#191919',
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
              style={{ color: '#C0A280', fontSize: 12, fontFamily: 'var(--font-geist-mono)' }}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{thread.comment_count}</span>
            </Link>

            <span
              className="flex items-center gap-1.5 px-2 py-1"
              style={{ color: '#C0A280', fontSize: 12, fontFamily: 'var(--font-geist-mono)' }}
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
