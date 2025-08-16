import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { requireAdminByAuthId } from '@/lib/auth'
import { parseYmdUTC } from '@/lib/date'

// GET -> list disabled meals for a date-range or month
export async function GET(req: Request) {
  const a: any = getAuth({ headers: headers() } as any)
  const authId = a?.userId || null
  const email = (a?.user?.emailAddresses && a.user.emailAddresses[0]?.emailAddress) || a?.user?.primaryEmailAddress?.emailAddress || null
  try {
    await requireAdminByAuthId(authId, email)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 })
  }
  const url = new URL((req as any).url)
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  const where: any = {}
  if (from && to) {
    where.date = { gte: new Date(from), lte: new Date(to) }
  }
  const fromDate = where.date?.gte ?? null
  const toDate = where.date?.lte ?? null
  let rows: any[] = []
  if (fromDate && toDate) {
    rows = await prisma.disabledMeal.findMany({ where: { date: { gte: fromDate, lte: toDate } }, orderBy: { date: 'asc' } })
  } else {
    rows = await prisma.disabledMeal.findMany({ orderBy: { date: 'asc' } })
  }
  return NextResponse.json(rows)
}

// POST -> create disabled meal record { date: 'YYYY-MM-DD', type: 'BREAKFAST'|'LUNCH'|'DINNER', reason?: string }
export async function POST(req: Request) {
  const a: any = getAuth({ headers: (req as any).headers } as any)
  const authId = a?.userId || null
  const email = (a?.user?.emailAddresses && a.user.emailAddresses[0]?.emailAddress) || a?.user?.primaryEmailAddress?.emailAddress || null
  try {
    await requireAdminByAuthId(authId, email)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 })
  }
    let body: any
    try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
    const { date, type } = body || {}
  if (!date || !type) return NextResponse.json({ error: 'date and type required' }, { status: 400 })
    const parsed = parseYmdUTC(String(date))
  if (!parsed) return NextResponse.json({ error: 'invalid date format, expected YYYY-MM-DD' }, { status: 400 })
    const created = await prisma.disabledMeal.create({ data: { date: parsed, type, createdBy: authId } })
  return NextResponse.json(created)
}

// DELETE -> remove a disabled entry by id (admin only)
export async function DELETE(req: Request) {
  const a: any = getAuth({ headers: (req as any).headers } as any)
  const authId = a?.userId || null
  const email = (a?.user?.emailAddresses && a.user.emailAddresses[0]?.emailAddress) || a?.user?.primaryEmailAddress?.emailAddress || null
  try {
    await requireAdminByAuthId(authId, email)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 })
  }
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await prisma.disabledMeal.deleteMany({ where: { id } })
  return NextResponse.json({ ok: true })
}
