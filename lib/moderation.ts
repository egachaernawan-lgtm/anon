import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ModerationResult } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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
Kembalikan HANYA JSON valid, tanpa markdown, tanpa teks tambahan apapun.`

/** Extract the first valid JSON object from the model's response.
 *  Gemini sometimes wraps output in prose or code fences — this handles both. */
function extractJSON(raw: string): ModerationResult {
  // 1. Strip markdown code fences (```json ... ``` or ``` ... ```)
  const stripped = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()

  // 2. Find the first '{' … last '}' substring and parse that
  const start = stripped.indexOf('{')
  const end   = stripped.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object found')

  return JSON.parse(stripped.slice(start, end + 1)) as ModerationResult
}

export async function moderateContent(content: string): Promise<ModerationResult> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
    })

    const result = await model.generateContent(
      `Periksa konten berikut dan kembalikan HANYA JSON:\n\n${content}`
    )
    const text = result.response.text().trim()
    return extractJSON(text)
  } catch {
    // Fail open — never block a post due to a moderation error
    return { safe: true, maskedContent: content, warningMessage: null, blocked: false }
  }
}
