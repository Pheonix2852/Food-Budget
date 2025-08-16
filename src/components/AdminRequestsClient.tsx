"use client"

import React, { useEffect, useState } from 'react'

type Req = { id: string; authId: string; email: string; name?: string }

export default function AdminRequestsClient() {
  const [reqs, setReqs] = useState<Req[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch('/api/admin/requests')
      .then((r) => r.json())
      .then((data) => setReqs(data))
      .catch((e) => setError((e as any)?.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  async function approve(r: Req, makeAdmin = false) {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authId: r.authId, email: r.email, name: r.name, makeAdmin }),
      })
      if (!res.ok) throw new Error('Approve failed')
      setReqs((s) => s.filter((x) => x.authId !== r.authId))
  try { window.dispatchEvent(new Event('sfb:stats-updated')) } catch {}
    } catch (err: any) {
      setError(err?.message || 'Approve failed')
    } finally {
      setLoading(false)
    }
  }

  async function reject(r: Req) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/requests?authId=${encodeURIComponent(r.authId)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Reject failed')
      setReqs((s) => s.filter((x) => x.authId !== r.authId))
  try { window.dispatchEvent(new Event('sfb:stats-updated')) } catch {}
    } catch (err: any) {
      setError(err?.message || 'Reject failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-screen-lg mx-auto py-12">
      <h1 className="text-2xl font-bold">Pending Join Requests</h1>
      {error && <div className="text-red-600 mt-4">{error}</div>}
      <div className="mt-6">
        {loading && <p>Loading…</p>}
        {!loading && reqs.length === 0 && <p>No pending requests</p>}
        {reqs.map((r) => (
          <div key={r.id} className="p-4 border rounded mb-2 flex justify-between items-center">
            <div>
              <div className="font-medium">{r.email}</div>
              <div className="text-sm text-muted-foreground">{r.name}</div>
            </div>
            <div className="flex gap-2">
              <button className="btn" onClick={() => approve(r)}>Approve</button>
              <button className="btn" onClick={() => approve(r, true)}>Approve + Admin</button>
              <button className="btn-ghost" onClick={() => reject(r)}>Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
