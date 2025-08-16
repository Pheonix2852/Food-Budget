"use server"
import { NextRequest } from 'next/server'
import { archiveLastMonth, archiveMonth } from '@/lib/archive'
import { isFirstDayOfMonth } from '@/lib/date'

// This can be called by a cron job service like Vercel Cron
// Supports:
// - GET /api/cron/archive  -> archives last month (only on day 1)
// - GET /api/cron/archive?force=true -> archives last month even if not day 1
// - GET /api/cron/archive?year=2025&month=8 -> archives specific month (month is 0-based)
export async function GET(request: NextRequest) {
  // Basic bearer auth
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 })
  }

  const token = authHeader.substring(7)
  if (token !== process.env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const url = new URL(request.url)
  const force = url.searchParams.get('force') === 'true'
  const y = url.searchParams.get('year')
  const m = url.searchParams.get('month')

  // If year & month supplied, archive that month (no cleanup unless you call manual endpoint)
  if (y && m) {
    const year = Number(y)
    const month0 = Number(m)
    if (Number.isNaN(year) || Number.isNaN(month0)) return new Response('Invalid year/month', { status: 400 })
    try {
      await archiveMonth(year, month0, { cleanup: true })
      return new Response('Archive created for specified month', { status: 200 })
    } catch (err) {
      console.error('Error archiving specified month:', err)
      return new Response('Error', { status: 500 })
    }
  }

  const today = new Date()
  if (!isFirstDayOfMonth(today) && !force) {
    return new Response('Not the first day of the month', { status: 200 })
  }

  try {
    await archiveLastMonth()
    return new Response('Monthly data archived successfully', { status: 200 })
  } catch (error) {
    console.error('Error archiving monthly data:', error)
    return new Response('Error archiving monthly data', { status: 500 })
  }
}
