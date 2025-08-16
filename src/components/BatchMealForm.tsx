"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

type UserOption = { id: string; name: string }

function todayLocalYmd() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function daysBetweenInclusive(a: string, b: string) {
  const pa = /^(\d{4})-(\d{2})-(\d{2})$/.exec(a)
  const pb = /^(\d{4})-(\d{2})-(\d{2})$/.exec(b)
  if (!pa || !pb) return 0
  const da = new Date(Number(pa[1]), Number(pa[2]) - 1, Number(pa[3]))
  const db = new Date(Number(pb[1]), Number(pb[2]) - 1, Number(pb[3]))
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.floor((db.getTime() - da.getTime()) / msPerDay) + 1
}

export default function BatchMealForm({ users }: { users: UserOption[] }) {
  const router = useRouter()
  const [userId, setUserId] = useState(users[0]?.id || '')
  const [startDate, setStartDate] = useState(todayLocalYmd())
  const [endDate, setEndDate] = useState(todayLocalYmd())
  // no reason field (removed per request)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const days = daysBetweenInclusive(startDate, endDate)
    if (days < 3) return setError('Minimum duration is 3 days')
    setLoading(true)
    try {
      const res = await fetch('/api/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, startDate, endDate }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to create batch')
      }
      router.refresh()
  setStartDate(todayLocalYmd())
  setEndDate(todayLocalYmd())
  // nothing to reset for reason
  try { window.dispatchEvent(new Event('sfb:stats-updated')) } catch {}
    } catch (err: any) {
      setError(err.message || 'Failed to create batch')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = Boolean(userId && startDate && endDate)

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger className="bg-background text-foreground w-full">
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id} className="text-foreground hover:bg-accent focus:bg-accent">
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          className="border border-foreground bg-background text-foreground rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full [color-scheme:dark]"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          min={todayLocalYmd()}
        />

        <input
          className="border border-foreground bg-background text-foreground rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full [color-scheme:dark]"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={startDate}
        />

        <Button type="submit" className="w-full" disabled={!canSubmit || loading}>
          {loading ? 'Creating…' : 'Create'}
        </Button>
      </div>

  {/* reason removed */}

      {error && <div className="text-sm text-red-600">{error}</div>}
    </form>
  )
}
