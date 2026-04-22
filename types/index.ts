export interface Category {
  id: number
  name: string
  slug: string
  icon: string
  subcategories?: Subcategory[]
}

export interface Subcategory {
  id: number
  category_id: number
  name: string
  slug: string
  category?: Category
}

export interface Thread {
  id: string
  subcategory_id: number
  title: string
  content: string
  author_uuid: string
  mask_id: string
  status: 'open' | 'closed' | 'removed'
  upvotes: number
  downvotes: number
  comment_count: number
  view_count: number
  is_ai_flagged: boolean
  created_at: string
  subcategory?: Subcategory
  user_reaction?: 'up' | 'down' | null
}

export interface Comment {
  id: string
  thread_id: string
  parent_id: string | null
  author_uuid: string
  mask_id: string
  content: string
  upvotes: number
  downvotes: number
  is_highlighted: boolean
  is_ai_flagged: boolean
  created_at: string
  replies?: Comment[]
  user_reaction?: 'up' | 'down' | null
}

export interface LocalThread {
  threadId: string
  ownerToken: string
  title: string
  subcategorySlug: string
  createdAt: string
  lastCheckedCommentCount?: number
}

export interface ModerationResult {
  safe: boolean
  maskedContent: string
  warningMessage: string | null
  blocked: boolean
}
