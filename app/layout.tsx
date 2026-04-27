import type { Metadata, Viewport } from 'next'
import { GeistMono } from 'geist/font/mono'
import { Space_Mono } from 'next/font/google'
import './globals.css'
import { CategoryDrawer } from '@/components/CategoryDrawer'
import { UserInit } from '@/components/UserInit'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/ThemeProvider'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { GoogleAnalytics } from '@next/third-parties/google'

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
})

export const metadata: Metadata = {
  title: 'Anonimo — Forum Anonim Indonesia',
  description: 'Tempat aman untuk berbagi cerita, bertanya, dan berdiskusi secara anonim.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FAF4E6',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${GeistMono.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased brand-bg brand-text">
        <ThemeProvider>
          <UserInit />

          {/* Sticky header */}
          <header className="sticky top-0 z-40 brand-bg/95 backdrop-blur border-b brand-border">
            <div className="max-w-lg mx-auto px-4 h-12 flex items-center gap-3">
              <CategoryDrawer />
              <Link
                href="/"
                className="flex-1 text-center font-bold text-base tracking-widest brand-text"
                style={{ fontFamily: 'var(--font-space-mono)' }}
              >
                ANONIMO
              </Link>
              <Link
                href="/cari"
                className="p-2 rounded-lg transition-colors brand-text"
                aria-label="Cari"
              >
                <Search className="w-5 h-5" />
              </Link>
            </div>
          </header>

          <main className="max-w-lg mx-auto w-full min-h-screen">
            {children}
          </main>

          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  )
}
