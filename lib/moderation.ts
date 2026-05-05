import Anthropic from '@anthropic-ai/sdk'
import type { ModerationResult } from '@/types'

const client = new Anthropic()   // reads ANTHROPIC_API_KEY from env

const SYSTEM_PROMPT = `Kamu adalah moderator konten untuk platform diskusi anonim bernama YAPPR yang ditujukan untuk pengguna Indonesia berusia 16+.

Tugasmu adalah memeriksa konten thread atau komentar dan mengembalikan respons JSON dengan format:
{"safe":boolean,"maskedContent":string,"warningMessage":string|null,"blocked":boolean}

Aturan moderasi:
1. Kata-kata kasar ringan (misuh biasa): ganti dengan ***, set safe=true, berikan warningMessage ringan
2. Ujaran kebencian berdasarkan ras/agama/gender: set safe=false, blocked=true
3. Konten SARA yang provokatif: set safe=false, blocked=true
4. Konten yang mengandung informasi pribadi orang lain (doxxing): set safe=false, blocked=true
5. Konten seksual eksplisit yang melibatkan anak-anak: set safe=false, blocked=true
6. Ancaman kekerasan nyata: set safe=false, blocked=true
7. Konten dewasa ringan (18+): boleh, set safe=true

Untuk warningMessage gunakan Bahasa Indonesia yang friendly.
Kembalikan HANYA JSON, tanpa markdown, tanpa teks lain.`

export async function moderateContent(content: string): Promise<ModerationResult> {
  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Periksa konten berikut:\n\n${content}` }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    const clean = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    return JSON.parse(clean) as ModerationResult
  } catch {
    // Fail open so a missing key never blocks posting
    return { safe: true, maskedContent: content, warningMessage: null, blocked: false }
  }
}
