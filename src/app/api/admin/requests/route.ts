import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { requireAdminByAuthId } from '@/lib/auth'

export async function GET() {
  // auth
  // Note: getAuth will read clerk session from the request
  // (cast to any to satisfy types)
  const a: any = getAuth({ headers: headers() } as any)
  const authId = a?.userId || null
  const email = (a?.user?.emailAddresses && a.user.emailAddresses[0]?.emailAddress) || a?.user?.primaryEmailAddress?.emailAddress || null
  try {
    await requireAdminByAuthId(authId, email)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 })
  }
  const reqs = await prisma.joinRequest.findMany({ orderBy: { createdAt: 'asc' } })
  return NextResponse.json(reqs)
}

export async function POST(req: Request) {
  // Approve request with body { authId, email, name, makeAdmin }
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const { authId, email, name, makeAdmin } = body || {}
  if (!authId || !email) return NextResponse.json({ error: 'authId and email required' }, { status: 400 })

  // auth
  const a: any = getAuth({ headers: (req as any).headers } as any)
  const callerAuthId = a.userId || null
  const callerEmail = (a.user?.emailAddresses && a.user.emailAddresses[0]?.emailAddress) || a.user?.primaryEmailAddress?.emailAddress || null
  try {
    await requireAdminByAuthId(callerAuthId, callerEmail)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 })
  }

  // Upsert user
  const existing = await prisma.user.findFirst({ where: { authId } })
  const user = existing
    ? await prisma.user.update({ where: { id: existing.id }, data: { approved: true, email, name: name || existing.name, role: makeAdmin ? 'ADMIN' : existing.role } })
    : await prisma.user.create({ data: { authId, email, name: name || 'New User', approved: true, role: makeAdmin ? 'ADMIN' : 'USER' } })

  // Remove join request
  await prisma.joinRequest.deleteMany({ where: { authId } })

  return NextResponse.json(user)
}

export async function DELETE(req: Request) {
  const a: any = getAuth({ headers: (req as any).headers } as any)
  const callerAuthId = a.userId || null
  const callerEmail = (a.user?.emailAddresses && a.user.emailAddresses[0]?.emailAddress) || a.user?.primaryEmailAddress?.emailAddress || null
  try {
    await requireAdminByAuthId(callerAuthId, callerEmail)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 })
  }
  const url = new URL(req.url)
  const authId = url.searchParams.get('authId')
  if (!authId) return NextResponse.json({ error: 'authId required' }, { status: 400 })
  await prisma.joinRequest.deleteMany({ where: { authId } })
  return NextResponse.json({ ok: true })
}
