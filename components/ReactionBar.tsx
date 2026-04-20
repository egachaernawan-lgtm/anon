'use client'

import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  upvotes: number
  downvotes: number
  userReaction: 'up' | 'down' | null
  onReact: (type: 'up' | 'down') => void
  size?: 'sm' | 'md'
}

export function ReactionBar({ upvotes, downvotes, userReaction, onReact, size = 'sm' }: Props) {
  const iconClass = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5'
  const btnClass = 'flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors text-xs font-medium'

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onReact('up')}
        className={cn(
          btnClass,
          userReaction === 'up'
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
        )}
        aria-label="Upvote"
      >
        <ChevronUp className={iconClass} />
        <span>{upvotes}</span>
      </button>

      <button
        onClick={() => onReact('down')}
        className={cn(
          btnClass,
          userReaction === 'down'
            ? 'bg-rose-500/20 text-rose-400'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
        )}
        aria-label="Downvote"
      >
        <ChevronDown className={iconClass} />
        <span>{downvotes}</span>
      </button>
    </div>
  )
}
