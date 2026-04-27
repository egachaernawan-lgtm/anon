'use client'

import { useState } from 'react'
import { ReactionBar } from './ReactionBar'
import { formatDistanceToNow } from '@/lib/time'
import type { Comment } from '@/types'
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
    <div className={cn(depth > 0 && 'ml-4 pl-3 border-l brand-border')}>
      <div
        className={cn(
          'rounded-lg p-3 mb-2 border transition-colors font-mono',
          comment.is_highlighted ? 'border-l-4' : 'brand-surface brand-border'
        )}
        style={comment.is_highlighted ? {
          backgroundColor: 'color-mix(in srgb, var(--green) 12%, var(--surface))',
          borderColor: 'var(--border)',
          borderLeftColor: 'var(--green)',
        } : {}}
      >
        {/* Comment header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold brand-text font-mono">{comment.mask_id}</span>
            {comment.is_highlighted && (
              <span
                className="text-xs px-1.5 py-0.5 rounded font-mono font-bold"
                style={{ color: 'var(--green)', backgroundColor: 'color-mix(in srgb, var(--green) 15%, transparent)' }}
              >
                ★ Pilihan
              </span>
            )}
          </div>
          <span className="text-xs brand-muted font-mono">{formatDistanceToNow(comment.created_at)}</span>
        </div>

        <p className="text-sm brand-text leading-relaxed font-mono">{comment.content}</p>

        {/* Action row */}
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
              className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-mono brand-muted hover:brand-text transition-colors"
            >
              ↩ Balas
            </button>
          )}

          {isOwner && ownerToken && (
            <button
              onClick={() => onHighlight(comment.id)}
              className={cn(
                'flex items-center gap-1 px-2 py-1.5 rounded text-xs font-mono transition-colors ml-auto',
                comment.is_highlighted ? 'font-bold' : 'brand-muted hover:brand-text'
              )}
              style={comment.is_highlighted ? { color: 'var(--green)' } : {}}
            >
              ★
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
          className="text-xs font-mono brand-muted hover:brand-text mb-2 ml-3 transition-colors"
        >
          {showReplies ? 'Sembunyikan balasan' : `Lihat ${comment.replies!.length} balasan`}
        </button>
      )}
    </div>
  )
}
