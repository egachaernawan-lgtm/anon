import type { ModerationResult } from '@/types'

// ─── Word lists ───────────────────────────────────────────────────────────────

/** Mild profanity — mask the word, post with a warning. */
const MILD_WORDS = [
  // Common Indonesian curses
  'anjing', 'anjir', 'anjer',
  'babi',
  'bangsat', 'bangset',
  'bajingan',
  'kampret',
  'keparat',
  'goblok', 'goblog',
  'tolol',
  'bodoh',
  'tai', 'tahi',
  'sial', 'sialan',
  'asu',
  'jancok', 'jancuk', 'jangkrik',
  'kontol', 'memek',
  'ngentot', 'ngewe',
  'brengsek',
  'idiot', 'dungu',
  // English mild
  'shit', 'damn', 'crap', 'bastard',
]

/** Severe content — reject the post entirely. */
const SEVERE_PATTERNS: RegExp[] = [
  // Calls to violence
  /bunuh\s+(semua|kalian|mereka|lu|lo|kamu|dia)/i,
  /bakar\s+(rumah|masjid|gereja|vihara|kantor)/i,
  /habisi\s+(mereka|kalian|semua)/i,
  // Ethnic / racial hate combined with violence
  /\b(harus\s+)?(mati|dibasmi|dibunuh|dihapus)\b.{0,30}\b(cina|melayu|jawa|batak|kafir)\b/i,
  /\b(cina|melayu|jawa|batak|kafir)\b.{0,30}\b(mati|dibasmi|dibunuh|dihapus)\b/i,
  // Doxxing: phone number near an address keyword
  // Note: [\s\S] instead of . with /s flag — compatible with all TS targets
  /(\+62|08\d{8,11})[\s\S]{0,80}(jl\.|jalan\s|rt\s*\d|rw\s*\d)/i,
  /(jl\.|jalan\s|rt\s*\d|rw\s*\d)[\s\S]{0,80}(\+62|08\d{8,11})/i,
]

// ─── Core logic ───────────────────────────────────────────────────────────────

function buildWordRegex(word: string): RegExp {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(escaped, 'gi')
}

function maskMildWords(text: string): { masked: string; found: boolean } {
  let masked = text
  let found = false

  for (const word of MILD_WORDS) {
    const re = buildWordRegex(word)
    if (re.test(masked)) {
      found = true
      masked = masked.replace(re, (m) => '*'.repeat(m.length))
    }
  }

  return { masked, found }
}

function isSevere(text: string): boolean {
  return SEVERE_PATTERNS.some((re) => re.test(text))
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function moderateContent(content: string): Promise<ModerationResult> {
  // 1. Severe check — block immediately
  if (isSevere(content)) {
    return {
      safe: false,
      maskedContent: content,
      warningMessage: null,
      blocked: true,
    }
  }

  // 2. Mild profanity — mask and warn
  const { masked, found } = maskMildWords(content)
  if (found) {
    return {
      safe: false,
      maskedContent: masked,
      warningMessage:
        'Beberapa kata dalam kontenmu telah disensor otomatis. Harap jaga bahasa ya! 🙏',
      blocked: false,
    }
  }

  // 3. Clean
  return { safe: true, maskedContent: content, warningMessage: null, blocked: false }
}
