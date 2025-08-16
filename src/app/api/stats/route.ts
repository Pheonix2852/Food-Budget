import { NextResponse } from 'next/server'
import { getMonthStats } from '@/lib/stats'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const yearParam = url.searchParams.get('year')
  const monthParam = url.searchParams.get('month')

  const now = new Date()
  const year = yearParam ? Number(yearParam) : now.getFullYear()
  const month = monthParam ? Number(monthParam) : now.getMonth()

  if (Number.isNaN(year) || Number.isNaN(month)) {
    return NextResponse.json({ error: 'invalid year or month' }, { status: 400 })
  }

  const stats = await getMonthStats(year, month)
  return NextResponse.json(stats)
}
