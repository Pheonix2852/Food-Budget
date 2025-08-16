"use client"
import React, { useEffect, useState } from 'react'
import AdminDisabledMeals from './AdminDisabledMeals'

export default function AdminDisabledWrapper() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/admin/check')
        if (!mounted) return
        if (res.ok) {
          setIsAdmin(true)
        } else {
          const data = await res.json()
          setIsAdmin(false)
          setError(data?.error || 'Not authorized')
        }
      } catch (e: any) {
        if (!mounted) return
        setIsAdmin(false)
        setError(e?.message || 'Error')
      }
    })()
    return () => { mounted = false }
  }, [])

  if (isAdmin === null) return <div>Checking permissions...</div>
  if (!isAdmin) return <div className="text-red-600">{error || 'You are not authorized to view this section.'}</div>
  return <AdminDisabledMeals />
}
