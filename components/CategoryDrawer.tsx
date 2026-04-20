'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Menu, ChevronDown, ChevronRight } from 'lucide-react'
import { CATEGORIES } from '@/lib/categories'

export function CategoryDrawer() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Menu">
        <Menu className="w-5 h-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-zinc-950 border-zinc-800">
        <SheetHeader className="px-4 pt-5 pb-3 border-b border-zinc-800">
          <SheetTitle className="text-white font-bold text-lg">Anon</SheetTitle>
        </SheetHeader>

        <nav className="overflow-y-auto h-full pb-20">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
              pathname === '/' ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            🏠 Beranda
          </Link>

          <div className="px-4 pt-4 pb-1">
            <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Kategori</p>
          </div>

          {CATEGORIES.map((cat) => (
            <div key={cat.id}>
              <button
                onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <span>{cat.icon}</span>
                  {cat.name}
                </span>
                {expanded === cat.id ? (
                  <ChevronDown className="w-4 h-4 text-zinc-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                )}
              </button>

              {expanded === cat.id && (
                <div className="pl-4 bg-zinc-900/50">
                  {cat.subcategories?.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/${sub.slug}`}
                      onClick={() => setOpen(false)}
                      className={`flex items-center px-4 py-2.5 text-sm transition-colors ${
                        pathname === `/${sub.slug}`
                          ? 'text-white font-medium'
                          : 'text-zinc-500 hover:text-zinc-200'
                      }`}
                    >
                      /{sub.slug}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="border-t border-zinc-800 mt-2">
            <Link
              href="/threads-saya"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                pathname === '/threads-saya'
                  ? 'text-white bg-zinc-800'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              📋 Threads Saya
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
