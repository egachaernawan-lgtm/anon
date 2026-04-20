const ADJECTIVES = [
  'Merah', 'Biru', 'Hijau', 'Kuning', 'Ungu', 'Emas', 'Perak', 'Hitam',
  'Putih', 'Abu', 'Oranye', 'Coklat', 'Mawar', 'Nila', 'Toska', 'Krem',
  'Merah Muda', 'Magenta', 'Lembayung', 'Zamrud',
  'Berani', 'Cerah', 'Gelap', 'Terang', 'Dingin', 'Hangat', 'Liar', 'Tenang',
  'Cepat', 'Lambat', 'Besar', 'Kecil', 'Kuat', 'Lemah', 'Tajam', 'Halus',
  'Angin', 'Api', 'Air', 'Bumi', 'Langit', 'Laut', 'Hutan', 'Gunung',
  'Bintang', 'Bulan', 'Matahari', 'Badai',
]

async function hmacDigest(key: string, data: string): Promise<string> {
  const enc = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(data))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Server-side: uses Node crypto
function hmacDigestSync(key: string, data: string): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require('crypto')
  return crypto.createHmac('sha256', key).update(data).digest('hex')
}

function hexToMask(hex: string): string {
  const adjIndex = parseInt(hex.slice(0, 4), 16) % ADJECTIVES.length
  const num = parseInt(hex.slice(4, 8), 16) % 100
  return `Anon${ADJECTIVES[adjIndex].replace(' ', '')}${num}`
}

export function getMaskIdSync(threadId: string, userUuid: string): string {
  const secret = process.env.MASK_HMAC_SECRET ?? 'default-secret'
  const hex = hmacDigestSync(secret, `${threadId}:${userUuid}`)
  return hexToMask(hex)
}

export async function getMaskIdAsync(threadId: string, userUuid: string): Promise<string> {
  const secret = process.env.MASK_HMAC_SECRET ?? 'default-secret'
  const hex = await hmacDigest(secret, `${threadId}:${userUuid}`)
  return hexToMask(hex)
}

export function hashOwnerToken(token: string): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(token).digest('hex')
}
