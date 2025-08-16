"use client"

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

function todayYmdLocal() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function DateRefreshClient() {
  const router = useRouter()
  const current = useRef<string>(todayYmdLocal())

  useEffect(() => {
    let mounted = true
    const check = () => {
      const now = todayYmdLocal()
      if (!mounted) return
      if (now !== current.current) {
        current.current = now
        // trigger a soft refresh so server components re-render with new date
        router.refresh()
      }
    }

    const id = setInterval(check, 3000)

    // also check when tab becomes visible
    const onVisibility = () => { if (!document.hidden) check() }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      mounted = false
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [router])

  return null
}
