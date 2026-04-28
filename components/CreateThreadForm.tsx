'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CATEGORIES, getAllSubcategories } from '@/lib/categories'
import { saveLocalThread } from '@/lib/user'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

export function CreateThreadForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSubId = Number(searchParams.get('sub')) || undefined
  const initialSubSlug = searchParams.get('subSlug') ?? ''

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [subcategoryId, setSubcategoryId] = useState<number | undefined>(initialSubId)
  const [submitting, setSubmitting] = useState(false)

  const subcategories = getAllSubcategories()

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !subcategoryId) {
      toast.error('Isi semua kolom terlebih dahulu')
      return
    }
    setSubmitting(true)

    const res = await fetch('/api/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, subcategory_id: subcategoryId }),
    })

    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Gagal membuat thread')
      setSubmitting(false)
      return
    }

    if (data.warningMessage) {
      toast.warning(data.warningMessage)
    }

    // Store owner token locally
    const sub = subcategories.find((s) => s.id === subcategoryId)
    saveLocalThread({
      threadId: data.thread.id,
      ownerToken: data.ownerToken,
      title: data.thread.title,
      subcategorySlug: sub?.slug ?? '',
      createdAt: data.thread.created_at,
      lastCheckedCommentCount: 0,
    })

    toast.success('Thread berhasil dibuat!')
    router.push(`/thread/${data.thread.id}`)
  }, [title, content, subcategoryId, subcategories, router])

  // Group subcategories by category for select display
  return (
    <div className="px-4 pt-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-zinc-500 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-base font-bold text-white" style={{ color: '#000000' }}>Buat Thread Baru</h1>
      </div>

      <div className="bg-zinc-900 text-zinc-400 text-xs rounded-xl px-4 py-3 mb-5 border border-zinc-800" style={{ backgroundColor: '#FFFBF1', color: '#000000', borderColor: '#DCCAB4' }}>
        🔒 Thread ini akan diposting secara anonim. Tidak ada yang tahu identitasmu.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Kategori</label>
          <select
            value={subcategoryId ?? ''}
            onChange={(e) => setSubcategoryId(Number(e.target.value))}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors"
            style={{ backgroundColor: '#FFFBF1', color: '#000000', borderColor: '#DCCAB4' }}
            required
          >
            <option value="" disabled>Pilih kategori...</option>
            {CATEGORIES.map((cat) => (
              <optgroup key={cat.id} label={`${cat.icon} ${cat.name}`}>
                {cat.subcategories?.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Judul <span className="text-zinc-600">({title.length}/150)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tulis judul yang jelas dan menarik..."
            maxLength={150}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
            style={{ backgroundColor: '#FFFBF1', color: '#000000', borderColor: '#DCCAB4' }}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Isi Thread <span className="text-zinc-600">({content.length}/2000)</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ceritakan lebih detail. Kamu anonim, bebas bicara..."
            maxLength={2000}
            rows={8}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-500 transition-colors"
            style={{ backgroundColor: '#FFFBF1', color: '#000000', borderColor: '#DCCAB4' }}
            required
          />
        </div>

        <div className="text-xs text-zinc-600 space-y-1">
          <p>📋 Aturan komunitas:</p>
          <p>• Dilarang memposting konten SARA, kekerasan, atau doxxing</p>
          <p>• Konten akan dimoderasi oleh AI secara otomatis</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50 text-sm"
          style={{ backgroundColor: '#7D8978', color: '#ffffff', borderColor: '#3E473A' }}
        >
          {submitting ? 'Memposting...' : 'Posting Thread'}
        </button>
      </form>
    </div>
  )
}
