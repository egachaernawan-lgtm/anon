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

const TAB_H = 36  // tab height in px
const R     = 10  // corner radius in px
const PAD_L = 14  // tab label left padding
const PAD_R = 10  // tab label right padding before slant

/**
 * Build the folder-card path with a dynamic tab width.
 * The bezier + diagonal proportions match the design file.
 */
function buildCardPath(w: number, h: number, tabTextW: number): string {
  const tabEnd = PAD_L + tabTextW + PAD_R  // where tab top edge ends

  // Bezier: smooth S-curve from tab top into the diagonal
  const bx1 = tabEnd + 9   // CP1 — same Y, eases right
  const bx2 = tabEnd + 18  // CP2 — starts dropping
  const by2 = 10
  const bex = tabEnd + 22  // bezier end X
  const bey = 14            // bezier end Y

  // Diagonal line from bezier end down to body level
  const diagX = tabEnd + 38

  return [
    `M ${R} 0.5`,
    `H ${tabEnd}`,
    `C ${bx1} 0.5 ${bx2} ${by2} ${bex} ${bey}`,
    `L ${diagX} ${TAB_H}`,
    `H ${w - R}`,
    `Q ${w} ${TAB_H} ${w} ${TAB_H + R}`,
    `V ${h - R}`,
    `Q ${w} ${h} ${w - R} ${h}`,
    `H ${R}`,
    `Q 0 ${h} 0 ${h - R}`,
    `V ${R}`,
    `Q 0 0 ${R} 0.5`,
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

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const ro = new ResizeObserver(() => {
      const w = wrapper.offsetWidth
      const h = wrapper.offsetHeight
      const tabTextW = tabLabelRef.current?.offsetWidth ?? 100
      if (w > 0 && h > 0) setSvgPath(buildCardPath(w, h, tabTextW))
    })
    ro.observe(wrapper)
    if (tabLabelRef.current) ro.observe(tabLabelRef.current)
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

        {/* SVG card background — dynamic path matching tab label width */}
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
            <path
              d={svgPath}
              style={{ fill: 'var(--brand-surface)', stroke: 'var(--brand-border)' }}
              strokeWidth="1"
            />
          </svg>
        )}

        {/* Content (on top of SVG) */}
        <div style={{ position: 'relative' }}>

          {/* Header row: tab label (left) + mask · time (right) */}
          <div style={{ display: 'flex', alignItems: 'flex-end', height: TAB_H }}>

            {/* Folder tab label */}
            <Link
              ref={tabLabelRef}
              href={`/${slug}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: TAB_H,
                paddingLeft: PAD_L,
                paddingRight: PAD_R,
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
