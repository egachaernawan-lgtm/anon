'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Menu, ChevronDown, ChevronRight } from 'lucide-react'
import { CATEGORIES } from '@/lib/categories'
import { CATEGORY_COLORS } from '@/lib/categoryColors'

export function CategoryDrawer() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="p-2 rounded-lg transition-colors"
        style={{ color: '#191919' }}
        aria-label="Menu"
      >
        <Menu className="w-5 h-5" />
      </SheetTrigger>

      <SheetContent side="left" className="w-72 p-0 border-r" style={{ backgroundColor: '#FAF4E6', borderColor: '#DCCAB4' }}>
        <SheetHeader className="px-4 pt-5 pb-3 border-b" style={{ borderColor: '#DCCAB4' }}>
          <SheetTitle
            className="font-bold text-lg tracking-widest"
            style={{ fontFamily: 'var(--font-space-mono)', color: '#191919' }}
          >
            ANONIMO
          </SheetTitle>
        </SheetHeader>

        <nav className="overflow-y-auto h-full pb-20">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors"
            style={{
              color: pathname === '/' ? '#191919' : '#C0A280',
              backgroundColor: pathname === '/' ? '#DCCAB4' : 'transparent',
            }}
          >
            🏠 Beranda
          </Link>

          <div className="px-4 pt-4 pb-1">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#C0A280' }}>Kategori</p>
          </div>

          {CATEGORIES.map((cat) => (
            <div key={cat.id}>
              <button
                onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors"
                style={{ color: '#191919' }}
              >
                <span className="flex items-center gap-3">
                  <span>{cat.icon}</span>
                  <span style={{ color: CATEGORY_COLORS[cat.id] }}>{cat.name}</span>
                </span>
                {expanded === cat.id
                  ? <ChevronDown className="w-4 h-4" style={{ color: '#C0A280' }} />
                  : <ChevronRight className="w-4 h-4" style={{ color: '#C0A280' }} />
                }
              </button>

              {expanded === cat.id && (
                <div className="pl-4" style={{ backgroundColor: '#FFFBF1' }}>
                  {cat.subcategories?.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/${sub.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm transition-colors font-mono"
                      style={{
                        color: pathname === `/${sub.slug}` ? CATEGORY_COLORS[cat.id] : '#C0A280',
                        fontWeight: pathname === `/${sub.slug}` ? 600 : 400,
                      }}
                    >
                      /{sub.slug}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="border-t" style={{ borderColor: '#DCCAB4' }}>
            <Link
              href="/threads-saya"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors"
              style={{
                color: pathname === '/threads-saya' ? '#191919' : '#C0A280',
                backgroundColor: pathname === '/threads-saya' ? '#DCCAB4' : 'transparent',
              }}
            >
              📋 Threads Saya
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
