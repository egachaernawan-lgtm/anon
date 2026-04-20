import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ModerationResult } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const SYSTEM_PROMPT = `Kamu adalah moderator konten untuk platform diskusi anonim bernama Anon yang ditujukan untuk pengguna Indonesia berusia 16+.

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
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
    })

    const result = await model.generateContent(`Periksa konten berikut:\n\n${content}`)
    const text = result.response.text().trim()

    // Strip markdown code fences if present
    const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    return JSON.parse(clean) as ModerationResult
  } catch {
    return { safe: true, maskedContent: content, warningMessage: null, blocked: false }
  }
}
