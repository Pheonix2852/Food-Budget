import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuth } from '@clerk/nextjs/server'
import { requireUserByAuthId } from '@/lib/auth'

type MealKind = 'BREAKFAST' | 'LUNCH' | 'DINNER'
const isMealKind = (v: string): v is MealKind => v === 'BREAKFAST' || v === 'LUNCH' || v === 'DINNER'

function parseYmdUTC(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)
  if (!m) return null
  const [_, y, mo, d] = m
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)))
  return isNaN(date.getTime()) ? null : date
}
function isTodayOrFutureUTC(date: Date) {
  const now = new Date()
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  return date.getTime() >= todayUTC.getTime()
}

export async function POST(req: Request) {
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
  const type = typeof body.type === 'string' ? body.type.trim().toUpperCase() : ''
  if (!userId || !dateStr || !type) {
    return NextResponse.json({ error: 'userId, date, and type are required' }, { status: 400 })
  }
  if (!isMealKind(type)) return NextResponse.json({ error: 'Invalid meal type' }, { status: 400 })

  const date = parseYmdUTC(dateStr)
  if (!date) return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  if (!isTodayOrFutureUTC(date)) {
    return NextResponse.json({ error: 'Extras allowed for today or future only' }, { status: 400 })
  }

  const userExists = await prisma.user.findFirst({ where: { id: userId }, select: { id: true } })
  if (!userExists) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (currentUser.role !== 'ADMIN') {
    if (userId !== currentUser.id) return NextResponse.json({ error: 'Cannot add extra meal for other users' }, { status: 403 })
  }
  const created = await prisma.extraMeal.create({
    data: { userId, date, type },
    select: { id: true, userId: true, date: true, type: true },
  })

  return NextResponse.json(created, { status: 201 })
}