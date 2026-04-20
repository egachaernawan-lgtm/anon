import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { CategoryDrawer } from '@/components/CategoryDrawer'
import { UserInit } from '@/components/UserInit'
import { Toaster } from '@/components/ui/sonner'
import Link from 'next/link'
import { Search } from 'lucide-react'

const geist = Geist({ variable: '--font-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Anon — Forum Anonim Indonesia',
  description: 'Tempat aman untuk berbagi cerita, bertanya, dan berdiskusi secara anonim.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#09090b',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${geist.variable} dark`}>
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <UserInit />

        {/* Sticky header */}
        <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
          <div className="max-w-lg mx-auto px-4 h-12 flex items-center gap-3">
            <CategoryDrawer />
            <Link href="/" className="flex-1 text-center font-bold text-base tracking-tight text-white">
              Anon
            </Link>
            <Link href="/cari" className="p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Cari">
              <Search className="w-5 h-5" />
            </Link>
          </div>
        </header>

        <main className="max-w-lg mx-auto w-full min-h-screen">
          {children}
        </main>

        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
