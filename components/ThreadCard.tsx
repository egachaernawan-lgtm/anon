'use client'

import Link from 'next/link'
import { formatDistanceToNow } from '@/lib/time'
import { ReactionBar } from './ReactionBar'
import type { Thread } from '@/types'
import { MessageSquare, Share2 } from 'lucide-react'

interface Props {
  thread: Thread
  onReact?: (threadId: string, type: 'up' | 'down') => void
}

export function ThreadCard({ thread, onReact }: Props) {
  const handleShare = async () => {
    const url = `${window.location.origin}/thread/${thread.id}`
    if (navigator.share) {
      await navigator.share({ title: thread.title, url })
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
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
  )
}
