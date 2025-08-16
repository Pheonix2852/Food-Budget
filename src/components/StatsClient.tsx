"use client"

import useSWR from 'swr'
import React, { useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

type UserRow = { userId: string; name: string; points: number; personalSpend: number; foodCost: number; balance: number }

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function StatsClient() {
  const now = new Date()
  const key = `/api/stats?year=${now.getFullYear()}&month=${now.getMonth()}`
  const { data, error, isLoading, mutate } = useSWR(key, fetcher, { revalidateOnFocus: true, revalidateOnReconnect: true })

  useEffect(() => {
    function onMutated() { mutate() }
    window.addEventListener('sfb:stats-updated', onMutated)
    return () => window.removeEventListener('sfb:stats-updated', onMutated)
  }, [mutate])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <div className="text-sm text-muted-foreground">Loading stats…</div>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-4"><Skeleton className="h-28 w-full rounded-md" /></div>
          <div className="p-4"><Skeleton className="h-28 w-full rounded-md" /></div>
          <div className="p-4"><Skeleton className="h-28 w-full rounded-md" /></div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4"><Skeleton className="h-36 w-full rounded-md" /></div>
          ))}
        </div>
      </div>
    )
  }
  if (error) return <div className="text-red-600">{(error as any).message || 'Error'}</div>

  const monthlyGrocery = data?.monthlyGrocery ?? 0
  const totalPoints = data?.totalPoints ?? 0
  const costPerPoint = data?.costPerPoint ?? 0
  const perUser: UserRow[] = data?.perUser ?? []

  const fmt = (n: number) => n.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <div className="text-sm text-muted-foreground">Overview of this month's spending and points</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">{now.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
          <button onClick={() => mutate()} className="bg-blue-600 text-white px-3 py-2 rounded">Refresh</button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="p-4 bg-white/80 dark:bg-slate-800 rounded-lg shadow">
          <div className="text-sm text-muted-foreground">Monthly Grocery</div>
          <div className="text-2xl font-bold">{fmt(monthlyGrocery)}</div>
        </div>
        <div className="p-4 bg-white/80 dark:bg-slate-800 rounded-lg shadow">
          <div className="text-sm text-muted-foreground">Total Points</div>
          <div className="text-2xl font-bold">{totalPoints}</div>
        </div>
        <div className="p-4 bg-white/80 dark:bg-slate-800 rounded-lg shadow">
          <div className="text-sm text-muted-foreground">Cost per Point</div>
          <div className="text-2xl font-bold">{fmt(costPerPoint)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {perUser.map((u) => (
          <div key={u.userId} className="p-4 bg-white/80 dark:bg-slate-800 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-semibold">{u.name.split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
                <div className="font-semibold">{u.name}</div>
              </div>
              <div className="text-sm text-gray-600">{u.points} pts</div>
            </div>
            <div className="pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Personal Spend</span>
                <span>{fmt(u.personalSpend)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Food Cost</span>
                <span>{fmt(u.foodCost)}</span>
              </div>
              <div className="h-px bg-gray-100 my-2" />
              <div className="flex justify-between font-medium">
                <span className="text-gray-500">Balance</span>
                <span className={u.balance >= 0 ? 'text-green-600' : 'text-red-600'}>{fmt(u.balance)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
