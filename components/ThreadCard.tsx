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

interface Props {
  thread: Thread
  onReact?: (threadId: string, type: 'up' | 'down') => void
}

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

      {/* Folder wrapper */}
      <div className="mb-3">
        {/* Folder tab */}
        <div className="flex items-center" style={{ paddingLeft: '12px' }}>
          <Link
            href={`/${slug}`}
            className="inline-flex items-center px-3 py-1 text-xs font-mono font-bold rounded-t-md transition-opacity hover:opacity-80"
            style={{ backgroundColor: color, color: '#FFFBF1' }}
          >
            /{slug}
          </Link>
        </div>

        {/* Card body — top-left corner is flat where the tab sits */}
        <div
          className="border overflow-hidden"
          style={{
            backgroundColor: '#FFFBF1',
            borderColor: color,
            borderWidth: '1.5px',
            borderRadius: '0 8px 8px 8px',
          }}
        >
          {/* Meta row: mask + time */}
          <div className="px-3 pt-3 flex items-center justify-between gap-2">
            <span className="text-xs font-mono" style={{ color: '#C0A280' }}>
              {thread.mask_id}
            </span>
            <span className="text-xs font-mono" style={{ color: '#C0A280' }}>
              {formatDistanceToNow(thread.created_at)}
            </span>
          </div>

          {/* Content */}
          <Link href={`/thread/${thread.id}`} className="block px-3 pt-2 pb-2">
            <h3
              className="font-bold text-sm leading-snug line-clamp-2 mb-1"
              style={{ fontFamily: 'var(--font-space-mono)', color: '#191919' }}
            >
              {thread.title}
            </h3>
            <p className="text-xs leading-relaxed line-clamp-3 font-mono" style={{ color: '#6B5B45' }}>
              {thread.content}
            </p>
          </Link>

          {/* Stats bar */}
          <div className="px-3 pb-3 flex items-center gap-0.5 font-mono text-xs border-t" style={{ borderColor: '#DCCAB4' }}>
            <div className="pt-2">
              <ReactionBar
                upvotes={thread.upvotes}
                downvotes={thread.downvotes}
                userReaction={thread.user_reaction ?? null}
                onReact={(type) => onReact?.(thread.id, type)}
              />
            </div>

            <Link
              href={`/thread/${thread.id}`}
              className="flex items-center gap-1 px-2 py-1.5 pt-3 transition-colors"
              style={{ color: '#C0A280' }}
            >
              □ <span>{thread.comment_count}</span>
            </Link>

            <span className="flex items-center gap-1 px-2 py-1.5 pt-3" style={{ color: '#C0A280' }}>
              ⊙ <span>{thread.view_count ?? 0}</span>
            </span>

            <button
              onClick={handleShare}
              className="flex items-center px-2 py-1.5 pt-3 transition-colors ml-auto"
              style={{ color: '#C0A280' }}
              aria-label="Bagikan"
            >
              ↗
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
