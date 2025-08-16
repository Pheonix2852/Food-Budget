"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

const ALLOWED = ['/', '/sign-in', '/sign-up', '/pending']

export default function RequireAuth() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoaded) return
    if (ALLOWED.includes(pathname || '/')) return
    if (!isSignedIn) {
      router.replace('/sign-in')
      return
    }

    // If signed in, verify approval status with server. Retry because Clerk session cookies
    // may not be available to the server immediately after sign-in.
    ;(async () => {
      const maxAttempts = 6
      let attempt = 0
      let gotOk = false
      try {
        while (attempt < maxAttempts) {
          try {
            const res = await fetch('/api/auth/status', { credentials: 'include' })
            if (res.status === 200) {
              const data = await res.json()
              if (data.approved) {
                gotOk = true
                break
              }
              if (data.pending) {
                router.replace('/pending')
                return
              }
            }
          } catch (e) {
            // ignore and retry
          }
          attempt++
          await new Promise((r) => setTimeout(r, 200 * Math.pow(2, attempt)))
        }
      } catch (e) {
        // swallow
      }

      if (!gotOk) {
        // default to pending if we couldn't confirm approval
        router.replace('/pending')
      }
    })()
  }, [isLoaded, isSignedIn, pathname, router])

  return null
}
