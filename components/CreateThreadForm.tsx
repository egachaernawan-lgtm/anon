'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CATEGORIES, getAllSubcategories } from '@/lib/categories'
import { saveLocalThread } from '@/lib/user'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

export function CreateThreadForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSubId = Number(searchParams.get('sub')) || undefined

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

    if (data.warningMessage) toast.warning(data.warningMessage)

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

  const inputStyle = {
    fontFamily: 'var(--font-geist-mono)',
    backgroundColor: 'var(--brand-surface)',
    borderColor: 'var(--brand-border)',
    color: 'var(--brand-text)',
  }

  return (
    <div className="px-4 pt-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="brand-muted hover:brand-text transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1
          className="text-base font-bold brand-text"
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          Buat Thread Baru
        </h1>
      </div>

      {/* Anonymous notice — always #C0A280 bg */}
      <div
        className="text-xs rounded-xl px-4 py-3 mb-5"
        style={{ backgroundColor: '#C0A280', color: '#FFFFFF', fontFamily: 'var(--font-geist-mono)' }}
      >
        🔒 Thread ini akan diposting secara anonim. Tidak ada yang tahu identitasmu.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category */}
        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--brand-muted)' }}
          >
            Kategori
          </label>
          <select
            value={subcategoryId ?? ''}
            onChange={(e) => setSubcategoryId(Number(e.target.value))}
            className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-colors"
            style={inputStyle}
            required
          >
            <option value="" disabled style={{ color: 'var(--brand-muted)' }}>Pilih kategori...</option>
            {CATEGORIES.map((cat) => (
              <optgroup key={cat.id} label={`${cat.icon} ${cat.name}`}>
                {cat.subcategories?.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--brand-muted)' }}
          >
            Judul <span>({title.length}/150)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tulis judul yang jelas dan menarik..."
            maxLength={150}
            className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-colors placeholder:text-[#C0A280]"
            style={inputStyle}
            required
          />
        </div>

        {/* Content */}
        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--brand-muted)' }}
          >
            Isi Thread <span>({content.length}/2000)</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ceritakan lebih detail. Kamu anonim, bebas bicara..."
            maxLength={2000}
            rows={8}
            className="w-full border rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none transition-colors placeholder:text-[#C0A280]"
            style={inputStyle}
            required
          />
        </div>

        {/* Community rules — outside box, #C0A280 */}
        <div
          className="text-xs space-y-1"
          style={{ fontFamily: 'var(--font-geist-mono)', color: '#C0A280' }}
        >
          <p>📋 Aturan komunitas:</p>
          <p>• Dilarang memposting konten SARA, kekerasan, atau doxxing</p>
          <p>• Konten akan dimoderasi oleh AI secara otomatis</p>
        </div>

        {/* Submit button — uses same vars as Kirim */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm"
          style={{
            fontFamily: 'var(--font-geist-mono)',
            backgroundColor: 'var(--btn-kirim-bg)',
            border: '1.5px solid var(--btn-kirim-border)',
            color: 'var(--btn-kirim-text)',
          }}
        >
          {submitting ? 'Memposting...' : 'Posting Thread'}
        </button>
      </form>
    </div>
  )
}
