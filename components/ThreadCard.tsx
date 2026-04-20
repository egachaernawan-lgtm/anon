'use client'

import { useRef, useCallback } from 'react'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { formatDistanceToNow } from '@/lib/time'
import { ReactionBar } from './ReactionBar'
import { StoryCard } from './StoryCard'
import { shareAsStory } from '@/lib/shareStory'
import type { Thread } from '@/types'
import { MessageSquare, Share2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  thread: Thread
  onReact?: (threadId: string, type: 'up' | 'down') => void
}

export function ThreadCard({ thread, onReact }: Props) {
  const storyRef = useRef<HTMLDivElement>(null)

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/thread/${thread.id}`
    if (!storyRef.current) return

    const result = await shareAsStory(storyRef.current, url, thread.title)
    if (result === 'copied') toast.success('Link disalin!')
  }, [thread])

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

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors">
        <Link href={`/thread/${thread.id}`} className="block px-4 pt-4 pb-3">
          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 mb-1.5">
            {thread.title}
          </h3>
          <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3">{thread.content}</p>
          <p className="text-zinc-600 text-xs mt-2">
            {thread.mask_id} · {formatDistanceToNow(thread.created_at)}
          </p>
        </Link>

        <div className="px-4 pb-3 flex items-center gap-1">
          <ReactionBar
            upvotes={thread.upvotes}
            downvotes={thread.downvotes}
            userReaction={thread.user_reaction ?? null}
            onReact={(type) => onReact?.(thread.id, type)}
          />

          <Link
            href={`/thread/${thread.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-xs ml-1"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{thread.comment_count}</span>
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-xs"
            aria-label="Bagikan"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  )
}
