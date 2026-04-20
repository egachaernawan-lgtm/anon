import type { Category } from '@/types'

// Static category list to avoid DB round-trips on every render
export const CATEGORIES: Category[] = [
  {
    id: 1, name: 'Olahraga', slug: 'olahraga', icon: '⚽',
    subcategories: [
      { id: 1, category_id: 1, name: 'Sepak Bola', slug: 'sepak-bola' },
      { id: 2, category_id: 1, name: 'Basket', slug: 'basket' },
      { id: 3, category_id: 1, name: 'Badminton', slug: 'badminton' },
      { id: 4, category_id: 1, name: 'Olahraga Lain', slug: 'olahraga-lain' },
    ],
  },
  {
    id: 2, name: 'Hiburan', slug: 'hiburan', icon: '🎬',
    subcategories: [
      { id: 5, category_id: 2, name: 'Film & Series', slug: 'film-series' },
      { id: 6, category_id: 2, name: 'Musik', slug: 'musik' },
      { id: 7, category_id: 2, name: 'Gaming', slug: 'gaming' },
      { id: 8, category_id: 2, name: 'K-Pop', slug: 'kpop' },
      { id: 9, category_id: 2, name: 'Anime', slug: 'anime' },
    ],
  },
  {
    id: 3, name: 'Kehidupan', slug: 'kehidupan', icon: '💬',
    subcategories: [
      { id: 10, category_id: 3, name: 'Hubungan', slug: 'hubungan' },
      { id: 11, category_id: 3, name: 'Keluarga', slug: 'keluarga' },
      { id: 12, category_id: 3, name: 'Kesehatan Mental', slug: 'kesehatan-mental' },
      { id: 13, category_id: 3, name: 'Curhat', slug: 'curhat' },
    ],
  },
  {
    id: 4, name: 'Pendidikan', slug: 'pendidikan', icon: '📚',
    subcategories: [
      { id: 14, category_id: 4, name: 'Kuliah', slug: 'kuliah' },
      { id: 15, category_id: 4, name: 'Karir', slug: 'karir' },
      { id: 16, category_id: 4, name: 'Beasiswa', slug: 'beasiswa' },
    ],
  },
  {
    id: 5, name: 'Teknologi', slug: 'teknologi', icon: '💻',
    subcategories: [
      { id: 17, category_id: 5, name: 'Gadget', slug: 'gadget' },
      { id: 18, category_id: 5, name: 'Coding', slug: 'coding' },
      { id: 19, category_id: 5, name: 'Startup', slug: 'startup' },
    ],
  },
  {
    id: 6, name: 'Lainnya', slug: 'lainnya', icon: '🌀',
    subcategories: [
      { id: 20, category_id: 6, name: 'Random', slug: 'random' },
      { id: 21, category_id: 6, name: 'Pertanyaan Aneh', slug: 'pertanyaan-aneh' },
      { id: 22, category_id: 6, name: 'Dewasa 18+', slug: 'dewasa' },
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
