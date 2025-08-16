"use server"
import { NextRequest } from 'next/server'
import { archiveMonth } from '@/lib/archive'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 })
  }
  const token = authHeader.substring(7)
  if (token !== process.env.CRON_SECRET) return new Response('Unauthorized', { status: 401 })

  const url = new URL(request.url)
  const y = url.searchParams.get('year')
  const m = url.searchParams.get('month')
  if (!y || !m) return new Response('Missing year/month', { status: 400 })

  const year = Number(y)
  const month0 = Number(m) // expecting 0-based month
  if (Number.isNaN(year) || Number.isNaN(month0)) return new Response('Invalid year/month', { status: 400 })

  try {
    await archiveMonth(year, month0, { cleanup: false })
    return new Response('Archive created', { status: 200 })
  } catch (err) {
    console.error('Manual archive error', err)
    return new Response('Error', { status: 500 })
  }
}
