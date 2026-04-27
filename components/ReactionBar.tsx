'use client'

import { cn } from '@/lib/utils'

interface Props {
  upvotes: number
  downvotes: number
  userReaction: 'up' | 'down' | null
  onReact: (type: 'up' | 'down') => void
  size?: 'sm' | 'md'
}

export function ReactionBar({ upvotes, downvotes, userReaction, onReact }: Props) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onReact('up')}
        className={cn(
          'flex items-center gap-1 px-2 py-1.5 rounded text-xs font-mono font-medium transition-colors',
        )}
        style={{ color: userReaction === 'up' ? '#55AD88' : '#C0A280', fontWeight: userReaction === 'up' ? 700 : 500 }}
        aria-label="Upvote"
      >
        ∧ <span>{upvotes}</span>
      </button>

      <button
        onClick={() => onReact('down')}
        className={cn(
          'flex items-center gap-1 px-2 py-1.5 rounded text-xs font-mono font-medium transition-colors',
        )}
        style={{ color: userReaction === 'down' ? '#D44652' : '#C0A280', fontWeight: userReaction === 'down' ? 700 : 500 }}
        aria-label="Downvote"
      >
        ∨ <span>{downvotes}</span>
      </button>
    </div>
  )
}
