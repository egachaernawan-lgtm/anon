import { SubcategoryFeed } from '@/components/SubcategoryFeed'
import { findSubcategoryBySlug } from '@/lib/categories'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ subcategory: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subcategory } = await params
  const found = findSubcategoryBySlug(subcategory)
  if (!found) return {}
  return {
    title: `/${subcategory} — YAPPR`,
    description: `Diskusi ${found.subcategory.name} di YAPPR`,
  }
}

export default async function SubcategoryPage({ params }: Props) {
  const { subcategory } = await params
  const found = findSubcategoryBySlug(subcategory)
  if (!found) notFound()

  return (
    <SubcategoryFeed
      subcategoryId={found.subcategory.id}
      subcategorySlug={subcategory}
      subcategoryName={found.subcategory.name}
      categoryName={found.category.name}
    />
  )
}
