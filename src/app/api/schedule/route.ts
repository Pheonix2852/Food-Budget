import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuth } from '@clerk/nextjs/server'
import { requireUserByAuthId } from '@/lib/auth'

function parseYmdUTC(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)
  if (!m) return null
  const [_, y, mo, d] = m
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)))
  return isNaN(date.getTime()) ? null : date
}
function isFutureDayUTC(date: Date) {
  const now = new Date()
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  return date.getTime() > todayUTC.getTime()
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = (searchParams.get('userId') || '').trim()
  const dateStr = (searchParams.get('date') || '').trim() // YYYY-MM-DD
  if (!userId || !dateStr) {
    return NextResponse.json({ error: 'userId and date are required' }, { status: 400 })
  }
  const date = parseYmdUTC(dateStr)
  if (!date) return NextResponse.json({ error: 'Invalid date' }, { status: 400 })

  const sched = await prisma.mealSchedule.findUnique({
    where: { userId_date: { userId, date } },
    select: { breakfast: true, lunch: true, dinner: true, userId: true, date: true, id: true },
  })

  // Default is all ON if not set
  return NextResponse.json(
    sched ?? {
      id: null,
      userId,
      date,
      breakfast: true,
      lunch: true,
      dinner: true,
    },
  )
}

export async function PUT(req: Request) {
  const a: any = getAuth({ headers: (req as any).headers } as any)
  const authId = a.userId || null
  const email = (a.user?.emailAddresses && a.user.emailAddresses[0]?.emailAddress) || a.user?.primaryEmailAddress?.emailAddress || null
  let currentUser
  try {
    currentUser = await requireUserByAuthId(authId, email)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 })
  }
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const userId = typeof body.userId === 'string' ? body.userId.trim() : ''
  const dateStr = typeof body.date === 'string' ? body.date.trim() : ''
  const breakfast = Boolean(body.breakfast)
  const lunch = Boolean(body.lunch)
  const dinner = Boolean(body.dinner)

  if (!userId || !dateStr) return NextResponse.json({ error: 'userId and date are required' }, { status: 400 })
  const date = parseYmdUTC(dateStr)
  if (!date) return NextResponse.json({ error: 'Invalid date' }, { status: 400 })

  // Enforce future-only toggling (cannot change today or past)
  if (!isFutureDayUTC(date)) {
    return NextResponse.json({ error: 'Can only configure meals in advance (future dates only)' }, { status: 400 })
  }

  // Ensure user exists
  const userExists = await prisma.user.findFirst({ where: { id: userId }, select: { id: true } })
  if (!userExists) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (currentUser.role !== 'ADMIN') {
    if (userId !== currentUser.id) return NextResponse.json({ error: 'Cannot modify schedule for other users' }, { status: 403 })
  }

  const updated = await prisma.mealSchedule.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, breakfast, lunch, dinner },
    update: { breakfast, lunch, dinner },
    select: { id: true, userId: true, date: true, breakfast: true, lunch: true, dinner: true },
  })

  return NextResponse.json(updated)
}