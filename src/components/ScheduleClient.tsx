'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type UserOption = { id: string; name: string }
type Schedule = { breakfast: boolean; lunch: boolean; dinner: boolean }
type MealKind = 'BREAKFAST' | 'LUNCH' | 'DINNER'

function todayYmdUTC() {
  const now = new Date()
  const yyyy = now.getUTCFullYear()
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(now.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
function tomorrowYmdUTC() {
  const now = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()))
  now.setUTCDate(now.getUTCDate() + 1)
  const yyyy = now.getUTCFullYear()
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(now.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
function isFutureYmd(ymd: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)
  if (!m) return false
  const dt = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  return dt.getTime() > today.getTime()
}

export default function ScheduleClient({ users }: { users: UserOption[] }) {
  const router = useRouter()
  const [userId, setUserId] = useState(users[0]?.id || '')
  const [date, setDate] = useState(tomorrowYmdUTC()) // default: tomorrow (future-only rule)
  const [sched, setSched] = useState<Schedule | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const futureOnly = useMemo(() => isFutureYmd(date), [date])

  useEffect(() => {
    let abort = false
    async function load() {
      if (!userId || !date) return
      setLoading(true)
      setError(null)
      try {
        const url = `/api/schedule?userId=${encodeURIComponent(userId)}&date=${encodeURIComponent(date)}`
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load schedule')
        const data = await res.json()
        if (!abort) {
          setSched({
            breakfast: Boolean(data.breakfast),
            lunch: Boolean(data.lunch),
            dinner: Boolean(data.dinner),
          })
        }
      } catch (e: any) {
        if (!abort) setError(e.message || 'Failed to load schedule')
      } finally {
        if (!abort) setLoading(false)
      }
    }
    load()
    return () => {
      abort = true
    }
  }, [userId, date])

  async function save() {
    if (!sched) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, date, ...sched }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save')
      }
      router.refresh()
    } catch (e: any) {
      setError(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  function toggle(key: keyof Schedule) {
    if (!futureOnly || !sched) return
    setSched({ ...sched, [key]: !sched[key] })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger className="bg-background text-foreground">
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
          type="date"
          className="border border-foreground bg-background text-foreground rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full [color-scheme:dark]"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={todayYmdUTC()}
        />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Button
          type="button"
          variant={sched?.breakfast ? 'default' : 'outline'}
          onClick={() => toggle('breakfast')}
          disabled={!futureOnly || !sched}
          className="w-full"
        >
          🍳 Breakfast
        </Button>
        <Button
          type="button"
          variant={sched?.lunch ? 'default' : 'outline'}
          onClick={() => toggle('lunch')}
          disabled={!futureOnly || !sched}
          className="w-full"
        >
          🥪 Lunch
        </Button>
        <Button
          type="button"
          variant={sched?.dinner ? 'default' : 'outline'}
          onClick={() => toggle('dinner')}
          disabled={!futureOnly || !sched}
          className="w-full"
        >
          🍲 Dinner
        </Button>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={save}
          disabled={!futureOnly || !sched || saving}
          className="w-full sm:w-auto"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}