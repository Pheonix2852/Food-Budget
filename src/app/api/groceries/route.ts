import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuth } from '@clerk/nextjs/server'
import { requireUserByAuthId } from '@/lib/auth'

export async function GET() {
  const items = await prisma.grocery.findMany({
    orderBy: { date: 'desc' },
    select: {
      id: true,
      item: true,
      amount: true,
      paid: true,
      date: true,
      user: { select: { id: true, name: true } },
    },
  })
  return NextResponse.json(items)
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

  const item = typeof body.item === 'string' ? body.item.trim() : ''
  const paid = Boolean(body.paid)
  const userId = typeof body.userId === 'string' && body.userId.trim() ? body.userId.trim() : null
  const date =
    body.date && typeof body.date === 'string' ? new Date(body.date) : new Date()

  // amount sent in rupees; store paise (cents) as Int
  const amountNum = Number(body.amount)
  const validAmount = Number.isFinite(amountNum) && amountNum >= 0
  const amountCents = Math.round(amountNum * 100)

  if (!item) return NextResponse.json({ error: 'Item is required' }, { status: 400 })
  if (!validAmount) return NextResponse.json({ error: 'Amount must be a number' }, { status: 400 })
  if (paid && !userId)
    return NextResponse.json({ error: 'Select the payer when Paid is on' }, { status: 400 })

  if (paid && userId) {
    const exists = await prisma.user.findFirst({ where: { id: userId }, select: { id: true } })
    if (!exists) return NextResponse.json({ error: 'Payer not found' }, { status: 400 })
  }

  // Enforce that normal users can only create groceries for themselves
  if (currentUser.role !== 'ADMIN') {
    if (!userId || userId !== currentUser.id) return NextResponse.json({ error: 'Cannot create grocery for other users' }, { status: 403 })
  }

  const created = await prisma.grocery.create({
    data: {
      item,
      amount: amountCents,
      paid,
      date,
      userId: paid ? userId : null,
    },
    select: {
      id: true,
      item: true,
      amount: true,
      paid: true,
      date: true,
      user: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(created, { status: 201 })
}