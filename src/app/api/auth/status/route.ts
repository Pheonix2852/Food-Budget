import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { clerkClient } from '@clerk/nextjs/server'
import { safeGetAuth } from '@/lib/safeGetAuth'
import { getSessionUserByAuthId } from '@/lib/auth'

export async function GET(req: Request) {
  const a: any = safeGetAuth({ headers: (req as any).headers } as any)
  let authId = a.userId || null
  let email = (a.user?.emailAddresses && a.user.emailAddresses[0]?.emailAddress) || a.user?.primaryEmailAddress?.emailAddress || null

  // If userId present but no email payload, fetch from Clerk server-side
  if (authId && !email) {
    try {
      const client = await clerkClient()
      const cu: any = await client.users.getUser(authId)
      email = (cu?.emailAddresses && cu.emailAddresses[0]?.emailAddress) || cu?.primaryEmailAddress?.emailAddress || null
    } catch (e) {
      // ignore clerk client fetch errors; require server session below
    }
  }

  if (!authId || !email) return NextResponse.json({ error: 'Missing auth' }, { status: 401 })

  const user = await getSessionUserByAuthId(authId, email)
  if (!user) {
    // no linked user yet -> pending if joinRequest exists
    const reqs = await prisma.joinRequest.findFirst({ where: { authId } })
    if (reqs) return NextResponse.json({ pending: true })
    // also check by email
    const reqByEmail = await prisma.joinRequest.findFirst({ where: { email: email.toLowerCase() } })
    if (reqByEmail) return NextResponse.json({ pending: true })
    return NextResponse.json({ pending: true })
  }

  if (user.approved) return NextResponse.json({ approved: true, role: user.role })
  return NextResponse.json({ pending: true })
}
