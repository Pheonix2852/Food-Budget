import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, createdAt: true },
  })
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const name = typeof (body as any).name === 'string' ? (body as any).name.trim() : ''
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  if (name.length > 50) return NextResponse.json({ error: 'Name too long' }, { status: 400 })

  const user = await prisma.user.create({ data: { name } })
  return NextResponse.json(user, { status: 201 })
}
