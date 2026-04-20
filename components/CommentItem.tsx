'use client'

import { useState } from 'react'
import { ReactionBar } from './ReactionBar'
import { formatDistanceToNow } from '@/lib/time'
import type { Comment } from '@/types'
import { Star, Reply } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  comment: Comment
  isOwner: boolean
  threadId: string
  ownerToken: string | null
  userUuid: string | null
  onHighlight: (commentId: string) => void
  onReact: (commentId: string, type: 'up' | 'down') => void
  onReply: (parentId: string, parentMask: string) => void
  depth?: number
}

export function CommentItem({
  comment,
  isOwner,
  ownerToken,
  onHighlight,
  onReact,
  onReply,
  depth = 0,
}: Props) {
  const [showReplies, setShowReplies] = useState(true)
  const hasReplies = (comment.replies?.length ?? 0) > 0

  return (
    <div className={cn(depth > 0 && 'ml-4 pl-3 border-l border-zinc-800')}>
      <div
        className={cn(
          'rounded-xl p-3 mb-2 transition-colors',
          comment.is_highlighted
            ? 'bg-amber-500/10 border border-amber-500/30'
            : 'bg-zinc-900 border border-zinc-800'
        )}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-semibold text-zinc-300">{comment.mask_id}</span>
          {comment.is_highlighted && (
            <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3" /> Pilihan Pembuat
            </span>
          )}
          <span className="text-xs text-zinc-600 ml-auto">{formatDistanceToNow(comment.created_at)}</span>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed">{comment.content}</p>

        <div className="flex items-center gap-1 mt-2">
          <ReactionBar
            upvotes={comment.upvotes}
            downvotes={comment.downvotes}
            userReaction={comment.user_reaction ?? null}
            onReact={(type) => onReact(comment.id, type)}
          />

          {depth === 0 && (
            <button
              onClick={() => onReply(comment.id, comment.mask_id)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors text-xs"
            >
              <Reply className="w-3.5 h-3.5" />
              <span>Balas</span>
            </button>
          )}

          {isOwner && ownerToken && (
            <button
              onClick={() => onHighlight(comment.id)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors text-xs ml-auto',
                comment.is_highlighted
                  ? 'text-amber-400 hover:bg-amber-500/10'
                  : 'text-zinc-600 hover:text-amber-400 hover:bg-zinc-800'
              )}
            >
              <Star className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {hasReplies && showReplies && (
        <div>
          {comment.replies!.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isOwner={isOwner}
              threadId={comment.thread_id}
              ownerToken={ownerToken}
              userUuid={null}
              onHighlight={onHighlight}
              onReact={onReact}
              onReply={onReply}
              depth={1}
            />
          ))}
        </div>
      )}

      {hasReplies && (
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="text-xs text-zinc-600 hover:text-zinc-400 mb-2 ml-3"
        >
          {showReplies ? 'Sembunyikan balasan' : `Lihat ${comment.replies!.length} balasan`}
        </button>
      )}
    </div>
  )
}
