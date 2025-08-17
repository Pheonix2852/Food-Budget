"use server"

import prisma from '@/lib/prisma'
import { parseYmdUTC } from '@/lib/date'
import { safeGetAuth } from '@/lib/safeGetAuth'
import { requireUserByAuthId } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, startDate, endDate, reason } = body || {}
    if (!userId || !startDate || !endDate) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 })
    }

  const a: any = safeGetAuth({ headers: (request as any).headers } as any)
  const authId = a?.userId || null
  const email = (a?.user?.emailAddresses && a.user.emailAddresses[0]?.emailAddress) || a?.user?.primaryEmailAddress?.emailAddress || null
    let currentUser
    try {
      currentUser = await requireUserByAuthId(authId, email)
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || 'Unauthorized' }), { status: 401 })
    }

    const start = parseYmdUTC(startDate)
    const end = parseYmdUTC(endDate)
    if (!start || !end) return new Response(JSON.stringify({ error: 'Invalid dates' }), { status: 400 })

    const msPerDay = 24 * 60 * 60 * 1000
    const days = Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1
    if (days < 3) return new Response(JSON.stringify({ error: 'Minimum duration is 3 days' }), { status: 400 })

    // Ensure user exists
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })

    if (currentUser.role !== 'ADMIN') {
      if (userId !== currentUser.id) return new Response(JSON.stringify({ error: 'Cannot create batch for other users' }), { status: 403 })
    }

  const created = await prisma.batchMeal.create({ data: { userId, startDate: start, endDate: end } })
  return new Response(JSON.stringify({ id: created.id }), { status: 201 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 })
  const a: any = safeGetAuth({ headers: (request as any).headers } as any)
  const authId = a?.userId || null
  const email = (a?.user?.emailAddresses && a.user.emailAddresses[0]?.emailAddress) || a?.user?.primaryEmailAddress?.emailAddress || null
    let currentUser
    try {
      currentUser = await requireUserByAuthId(authId, email)
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || 'Unauthorized' }), { status: 401 })
    }

  const batch = await prisma.batchMeal.findFirst({ where: { id } })
    if (!batch) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    if (currentUser.role !== 'ADMIN') {
      if (batch.userId !== currentUser.id) return new Response(JSON.stringify({ error: 'Cannot delete other user batch' }), { status: 403 })
    }

  await prisma.batchMeal.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), { status: 500 })
  }
}
