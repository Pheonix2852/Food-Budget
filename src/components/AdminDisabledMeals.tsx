"use client"
import React, { useEffect, useState } from 'react'

type MealKind = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'FULL_DAY'

interface DisabledMealRow {
  id: string
  date: string
  type: MealKind
  createdBy?: string | null
  createdAt?: string | null
}

export default function AdminDisabledMeals() {
  const [rows, setRows] = useState<DisabledMealRow[]>([])
  function todayLocalYmd() {
    const now = new Date()
  // use local date parts so the input defaults to the user's local day
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const [date, setDate] = useState(todayLocalYmd())
  const [type, setType] = useState<MealKind>('BREAKFAST')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const fetchRows = async () => {
    setLoading(true)
    try {
      // fetch entries for current month
      const now = new Date()
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
      const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999))
  const from = start.toLocaleDateString('en-CA')
  const to = end.toLocaleDateString('en-CA')
  const res = await fetch(`/api/admin/disabled?from=${from}&to=${to}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setRows(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setMessage(err?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRows() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/disabled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, type }),
      })
      if (!res.ok) throw new Error('Failed to create')
      await fetchRows()
      setDate('')
  // reset other inputs
      setMessage('Created')
  // notify stats clients to refresh
  try { window.dispatchEvent(new Event('sfb:stats-updated')) } catch {}
    } catch (err: any) {
      setMessage(err?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/disabled?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      await fetchRows()
      setMessage('Deleted')
  try { window.dispatchEvent(new Event('sfb:stats-updated')) } catch {}
    } catch (err: any) {
      setMessage(err?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h3 className="text-lg font-medium">Disabled Meals (Admin — removes points)</h3>
      {message && <div className="text-sm my-2">{message}</div>}
      <form onSubmit={handleCreate} className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input
            className="border border-foreground bg-background text-foreground rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full [color-scheme:dark]"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <select className="bg-background text-foreground w-full border border-foreground rounded px-3 py-2" value={type} onChange={(e) => setType(e.target.value as MealKind)}>
            <option value="BREAKFAST">🍳 Breakfast (−1)</option>
            <option value="LUNCH">🥪 Lunch (−2)</option>
            <option value="DINNER">🍲 Dinner (−2)</option>
            <option value="FULL_DAY">🌞 Full Day (−5)</option>
          </select>

          <div />

          <div>
            <button className="bg-blue-600 text-white px-3 py-2 rounded w-full" type="submit" disabled={loading}>Add</button>
          </div>
        </div>
      </form>

      <div className="mt-4">
        {loading ? <div>Loading...</div> : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left">Date</th>
                <th className="text-left">Type</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t">
                      {/* show date in local ISO-like format (en-CA) so it matches the user's local day */}
                      <td>{new Date(r.date).toLocaleDateString('en-CA')}</td>
                      <td>{r.type}</td>
                      <td>
                        <button className="text-red-600" onClick={() => handleDelete(r.id)} disabled={loading}>Delete</button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
