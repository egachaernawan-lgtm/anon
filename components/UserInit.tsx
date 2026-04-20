'use client'

import { useEffect } from 'react'
import { getOrCreateUserUUID } from '@/lib/user'

export function UserInit() {
  useEffect(() => {
    const uuid = getOrCreateUserUUID()
    // Register with server
    fetch('/api/user/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uuid }),
    }).catch(() => {})
  }, [])

  return null
}
