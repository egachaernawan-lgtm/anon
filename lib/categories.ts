import type { Category } from '@/types'

// Static category list to avoid DB round-trips on every render
export const CATEGORIES: Category[] = [
  {
    id: 7, name: 'Kehidupan', slug: 'kehidupan', icon: '💬',
    subcategories: [
      { id: 23, category_id: 7, name: 'Kehidupan', slug: 'kehidupan' },
    ],
  },
  {
    id: 8, name: 'Cinta', slug: 'cinta', icon: '❤️',
    subcategories: [
      { id: 24, category_id: 8, name: 'Cinta', slug: 'cinta' },
    ],
  },
  {
    id: 9, name: 'Uang', slug: 'uang', icon: '💰',
    subcategories: [
      { id: 25, category_id: 9, name: 'Uang', slug: 'uang' },
    ],
  },
]

export function findSubcategoryBySlug(slug: string) {
  for (const cat of CATEGORIES) {
    const sub = cat.subcategories?.find((s) => s.slug === slug)
    if (sub) return { subcategory: sub, category: cat }
  }
  return null
}

export function getAllSubcategories() {
  return CATEGORIES.flatMap((c) => c.subcategories ?? [])
}
