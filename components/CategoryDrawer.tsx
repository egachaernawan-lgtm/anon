'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Menu, ChevronDown, ChevronRight, Sun, Moon } from 'lucide-react'
import { CATEGORIES } from '@/lib/categories'
import { CATEGORY_COLORS } from '@/lib/categoryColors'

export function CategoryDrawer() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const touchStartX = useRef(0)

  useEffect(() => setMounted(true), [])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="p-2 rounded-lg transition-colors brand-text" aria-label="Menu">
        <Menu className="w-5 h-5" />
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-72 p-0 border-r brand-bg brand-border"
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
        onTouchEnd={(e) => {
          const delta = touchStartX.current - e.changedTouches[0].clientX
          if (delta > 48) setOpen(false)
        }}
      >
        <SheetHeader className="px-4 pt-5 pb-3 border-b brand-border">
          <SheetTitle
            className="brand-text font-bold text-lg tracking-widest"
            style={{ fontFamily: 'var(--font-space-mono)' }}
          >
            YAPPR
          </SheetTitle>
        </SheetHeader>

        <nav className="overflow-y-auto h-full pb-20">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
              pathname === '/' ? 'brand-text brand-surface' : 'brand-muted hover:brand-text'
            }`}
          >
            🏠 Beranda
          </Link>

          <div className="px-4 pt-4 pb-1">
            <p className="text-xs font-semibold brand-muted uppercase tracking-wider">Kategori</p>
          </div>

          {CATEGORIES.map((cat) => (
            <div key={cat.id}>
              <button
                onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium brand-text transition-colors hover:brand-surface"
              >
                <span className="flex items-center gap-3">
                  <span>{cat.icon}</span>
                  <span style={{ color: CATEGORY_COLORS[cat.id] }}>{cat.name}</span>
                </span>
                {expanded === cat.id
                  ? <ChevronDown className="w-4 h-4 brand-muted" />
                  : <ChevronRight className="w-4 h-4 brand-muted" />
                }
              </button>

              {expanded === cat.id && (
                <div className="pl-4 brand-surface">
                  {cat.subcategories?.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/${sub.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm transition-colors font-mono"
                      style={{
                        color: pathname === `/${sub.slug}` ? CATEGORY_COLORS[cat.id] : 'var(--brand-muted)',
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

          <div className="border-t brand-border">
            <Link
              href="/threads-saya"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                pathname === '/threads-saya' ? 'brand-text brand-surface' : 'brand-muted hover:brand-text'
              }`}
            >
              📋 Threads Saya
            </Link>
          </div>

          {/* Theme toggle — only render after hydration */}
          {mounted && (
            <div className="border-t brand-border">
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium brand-muted hover:brand-text transition-colors"
              >
                {resolvedTheme === 'dark'
                  ? <><Sun className="w-4 h-4" /> <span>Light Mode</span></>
                  : <><Moon className="w-4 h-4" /> <span>Dark Mode</span></>
                }
              </button>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
