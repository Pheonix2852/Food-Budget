'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

type UserOption = { id: string; name: string }

export default function AddGroceryForm({ users }: { users: UserOption[] }) {
  const router = useRouter()
  const [item, setItem] = useState('')
  const [amount, setAmount] = useState('')
  const [paid, setPaid] = useState(true)
  const [userId, setUserId] = useState<string>(users[0]?.id || '')
  const [date, setDate] = useState<string>(() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!item.trim() || !amount.trim()) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/groceries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: item.trim(),
          amount: Number(amount),
          paid,
          userId: paid ? userId : null,
          date,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to add grocery')
      }
      setItem('')
      setAmount('')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to add grocery')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="item">Item</Label>
          <Input
            id="item"
            placeholder="Grocery item name"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            maxLength={80}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            placeholder="0.00"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="payer">Payer</Label>
          <Select 
            value={userId} 
            onValueChange={setUserId}
            disabled={!paid}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payer" />
            </SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="paid" 
            checked={paid}
            onCheckedChange={(checked) => setPaid(checked as boolean)}
          />
          <Label htmlFor="paid">Paid</Label>
        </div>

        <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
          {loading ? "Adding..." : "Add Grocery"}
        </Button>
      </div>

      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </form>
  )
}