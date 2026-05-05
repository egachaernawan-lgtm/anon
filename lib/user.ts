import { v4 as uuidv4 } from 'uuid'

const USER_UUID_KEY = 'anon_user_uuid'
const COOKIE_NAME = 'anon_uid'

export function getOrCreateUserUUID(): string {
  if (typeof window === 'undefined') return ''

  let uuid = localStorage.getItem(USER_UUID_KEY)
  if (!uuid) {
    uuid = uuidv4()
    localStorage.setItem(USER_UUID_KEY, uuid)
  }

  // also keep in cookie for server-side reads
  const maxAge = 30 * 24 * 60 * 60 // 30 days
  document.cookie = `${COOKIE_NAME}=${uuid}; path=/; max-age=${maxAge}; SameSite=Lax`

  return uuid
}

export function getUserUUIDFromCookie(cookieHeader: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`))
  return match ? match[1] : null
}

export const LOCAL_THREADS_KEY = 'anon_threads'

export interface LocalThreadEntry {
  threadId: string
  ownerToken: string
  title: string
  subcategorySlug: string
  createdAt: string
  lastCheckedCommentCount?: number
}

export function getLocalThreads(): LocalThreadEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_THREADS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveLocalThread(entry: LocalThreadEntry) {
  const threads = getLocalThreads()
  const existing = threads.findIndex((t) => t.threadId === entry.threadId)
  if (existing >= 0) {
    threads[existing] = entry
  } else {
    threads.unshift(entry)
  }
  localStorage.setItem(LOCAL_THREADS_KEY, JSON.stringify(threads))
}

export function getOwnerToken(threadId: string): string | null {
  const threads = getLocalThreads()
  return threads.find((t) => t.threadId === threadId)?.ownerToken ?? null
}

export function updateLastChecked(threadId: string, count: number) {
  const threads = getLocalThreads()
  const entry = threads.find((t) => t.threadId === threadId)
  if (entry) {
    entry.lastCheckedCommentCount = count
    localStorage.setItem(LOCAL_THREADS_KEY, JSON.stringify(threads))
  }
}

export function removeLocalThread(threadId: string) {
  const threads = getLocalThreads().filter((t) => t.threadId !== threadId)
  localStorage.setItem(LOCAL_THREADS_KEY, JSON.stringify(threads))
}
