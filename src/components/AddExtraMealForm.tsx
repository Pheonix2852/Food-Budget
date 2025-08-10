'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

type UserOption = { id: string; name: string }
type MealKind = 'BREAKFAST' | 'LUNCH' | 'DINNER'

function todayYmdUTC() {
  const now = new Date()
  const yyyy = now.getUTCFullYear()
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(now.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function AddExtraMealForm({ users }: { users: UserOption[] }) {
  const router = useRouter()
  const [userId, setUserId] = useState(users[0]?.id || '')
  const [date, setDate] = useState(todayYmdUTC())
  const [type, setType] = useState<MealKind>('BREAKFAST')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => Boolean(userId && date && type), [userId, date, type])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/extras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, date, type }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to add extra meal')
      }
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to add extra meal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger className="bg-background text-foreground w-full">
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            {users.map((u) => (
              <SelectItem
                key={u.id}
                value={u.id}
                className="text-foreground hover:bg-accent focus:bg-accent"
              >
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          className="border border-foreground bg-background text-foreground rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full [color-scheme:dark]"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={todayYmdUTC()}
        />

        <Select value={type} onValueChange={(value) => setType(value as MealKind)}>
          <SelectTrigger className="bg-background text-foreground w-full">
            <SelectValue placeholder="Select meal type" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            <SelectItem
              value="BREAKFAST"
              className="text-foreground hover:bg-accent focus:bg-accent"
            >
              🍳 Breakfast (+1)
            </SelectItem>
            <SelectItem
              value="LUNCH"
              className="text-foreground hover:bg-accent focus:bg-accent"
            >
              🥪 Lunch (+2)
            </SelectItem>
            <SelectItem
              value="DINNER"
              className="text-foreground hover:bg-accent focus:bg-accent"
            >
              🍲 Dinner (+2)
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="submit"
          className="w-full"
          disabled={!canSubmit || loading}
        >
          {loading ? 'Adding…' : 'Add'}
        </Button>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
    </form>
  )
}