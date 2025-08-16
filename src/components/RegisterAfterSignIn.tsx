'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSignIn, useUser } from '@clerk/nextjs'

export default function RegisterAfterSignIn() {
  const router = useRouter()
  const pathname = usePathname()
  const { isSignedIn, user } = useUser()

  useEffect(() => {
    if (!isSignedIn) return
    ;(async () => {
      // Retry POST to /api/auth/register a few times to avoid race with Clerk handshake/cookie propagation
      const maxAttempts = 6
      let attempt = 0
      let lastRes: Response | null = null
      while (attempt < maxAttempts) {
        try {
          const res = await fetch('/api/auth/register', { method: 'POST', credentials: 'include' })
          lastRes = res
          if (res.status === 200) break
        } catch (e) {
          // ignore and retry
        }
        attempt++
        // exponential backoff
        await new Promise((r) => setTimeout(r, 200 * Math.pow(2, attempt)))
      }

      if (!lastRes) {
        router.replace('/pending')
        return
      }
      const data = await lastRes.json().catch(() => ({ pending: true }))
      if (data.pending) {
        router.replace('/pending')
      } else {
        // Only redirect to home when the user is on an auth page. Otherwise refresh
        // the current route so server components can re-run and pick up the approved role.
        if (pathname === '/sign-in' || pathname === '/sign-up') {
          router.replace('/')
        } else {
          try { router.refresh() } catch (e) { /* best-effort refresh */ }
          try { window.dispatchEvent(new Event('sfb:stats-updated')) } catch {}
        }
      }
    })()
  }, [isSignedIn, router])

  return null
}
