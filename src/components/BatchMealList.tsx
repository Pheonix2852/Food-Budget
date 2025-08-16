"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'

type Batch = { id: string; userId: string; userName: string; startDate: string; endDate: string }

function formatDDMMYYYY(iso: string) {
  // input expected YYYY-MM-DD
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return iso
  return `${m[3]}-${m[2]}-${m[1]}`
}

export default function BatchMealList({ batches }: { batches: Batch[] }) {
  const [deleting, setDeleting] = useState<string | null>(null)
  async function onDelete(id: string) {
    if (!confirm('Delete this batch?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/batch?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete')
  try { window.dispatchEvent(new Event('sfb:stats-updated')) } catch {}
    } catch (e) {
  alert(((e as unknown) as { message?: string }).message || 'Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  if (!batches || batches.length === 0) return <div className="text-sm text-muted-foreground">No batch meals</div>

  return (
    <div className="space-y-2">
      {batches.map(b => (
        <div key={b.id} className="p-3 border rounded flex items-start justify-between">
          <div>
            <div className="font-medium">{b.userName}</div>
            <div className="text-sm text-muted-foreground">{formatDDMMYYYY(b.startDate)} → {formatDDMMYYYY(b.endDate)}</div>
          </div>
          <div>
            <Button variant="destructive" size="sm" onClick={() => onDelete(b.id)} disabled={deleting === b.id}>
              {deleting === b.id ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
