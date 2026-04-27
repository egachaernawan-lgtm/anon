// Brand category color palette — one accent color per category
// category_id → hex color
export const CATEGORY_COLORS: Record<number, string> = {
  1: '#F27420', // Olahraga    — orange
  2: '#2097F2', // Hiburan     — blue
  3: '#F674A6', // Kehidupan   — pink
  4: '#55AD88', // Pendidikan  — green
  5: '#20D4C8', // Teknologi   — cyan
  6: '#F2C94C', // Lainnya     — yellow
}

// subcategory_id → parent category_id
const SUB_TO_CAT: Record<number, number> = {
  1: 1, 2: 1, 3: 1, 4: 1,           // Olahraga
  5: 2, 6: 2, 7: 2, 8: 2, 9: 2,    // Hiburan
  10: 3, 11: 3, 12: 3, 13: 3,      // Kehidupan
  14: 4, 15: 4, 16: 4,              // Pendidikan
  17: 5, 18: 5, 19: 5,              // Teknologi
  20: 6, 21: 6, 22: 6,              // Lainnya
}

export function getCategoryColor(subcategoryId: number): string {
  const catId = SUB_TO_CAT[subcategoryId]
  return CATEGORY_COLORS[catId] ?? '#C0A280'
}
