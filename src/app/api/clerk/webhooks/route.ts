import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

const secret = process.env.CLERK_WEBHOOK_SECRET || ''

function verify(body: string, signature: string | null) {
  if (!secret) return false
  if (!signature) return false
  const hmac = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return signature === hmac
}

export async function POST(req: Request) {
  const signature = req.headers.get('x-clerk-signature')
  const bodyText = await req.text()
  if (!verify(bodyText, signature)) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

  let payload: any
  try {
    payload = JSON.parse(bodyText)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Handle user.created event
  if (payload?.type === 'user.created' && payload?.data) {
    const u = payload.data
    const authId = u.id
    const email = u.email_addresses && u.email_addresses[0] ? u.email_addresses[0].email_address : u.primary_email_address?.email_address
    const name = u.first_name || u.full_name || u.last_name || 'New User'
    if (!email) return NextResponse.json({ ok: true })

    // Attempt match-by-email
    const existing = await prisma.user.findFirst({ where: { email } })
    if (existing) {
      await prisma.user.update({ where: { id: existing.id }, data: { authId } })
      return NextResponse.json({ ok: true })
    }

    // If email matches ADMIN_EMAIL, auto-create admin approved
    if (process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()) {
  await prisma.user.create({ data: { authId, email, name, approved: true, role: 'ADMIN' } })
      return NextResponse.json({ ok: true })
    }

    // Otherwise create a join request if not already present
    const existsReq = await prisma.joinRequest.findFirst({ where: { authId } })
    if (!existsReq) {
      await prisma.joinRequest.create({ data: { authId, email, name } })
    }
  }

  return NextResponse.json({ ok: true })
}
