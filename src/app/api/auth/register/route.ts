import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { clerkClient } from '@clerk/nextjs/server'
import { safeGetAuth } from '@/lib/safeGetAuth'

export async function POST(req: Request) {
  const a: any = safeGetAuth({ headers: (req as any).headers } as any)
  const authId = a.userId || null
  let email = (a.user?.emailAddresses && a.user.emailAddresses[0]?.emailAddress) || a.user?.primaryEmailAddress?.emailAddress || null
  let name = a.user?.firstName || a.user?.fullName || null
  // If getAuth returned a userId but no detailed user payload, fetch server-side from Clerk
  if (authId && !email) {
    try {
      const client = await clerkClient()
      const cu: any = await client.users.getUser(authId)
      email = (cu?.emailAddresses && cu.emailAddresses[0]?.emailAddress) || cu?.primaryEmailAddress?.emailAddress || email
      name = cu?.firstName || cu?.fullName || name
    } catch (e) {
      // ignore server-side clerk fetch failures; we'll require a valid server session below
    }
  }

  // Require server-side Clerk session (no client-sent fallback in production)
  if (!authId || !email) {
    return NextResponse.json({ error: 'Missing server session' }, { status: 401 })
  }

  const effectiveAuthId = authId
  const effectiveEmail = (email || '').toLowerCase()
  const effectiveName = name || null

  // If a user exists by authId and is approved, return ok
  const byAuth = await prisma.user.findFirst({ where: { authId } })
  if (byAuth) return NextResponse.json({ ok: true })

  // Try match-by-email (use effectiveEmail)
  const byEmail = await prisma.user.findFirst({ where: { email: effectiveEmail } })
  if (byEmail) {
    // link authId
    await prisma.user.update({ where: { id: byEmail.id }, data: { authId: effectiveAuthId } })
    if (byEmail.approved) return NextResponse.json({ ok: true })
    // not approved -> ensure join request removed/created
    await prisma.joinRequest.deleteMany({ where: { authId: effectiveAuthId } })
    // create only if not exists
    const existsReq = await prisma.joinRequest.findFirst({ where: { authId: effectiveAuthId } })
    if (!existsReq) {
      try {
        await prisma.joinRequest.create({ data: { authId: effectiveAuthId, email: effectiveEmail, name: effectiveName } })
      } catch (e: any) {
        // ignore conflicts and continue as pending
      }
    }
    return NextResponse.json({ pending: true })
  }

  // If ADMIN_EMAIL matches, create admin
  // Only auto-create admin when we have a server-verified Clerk session (authId present)
  if (authId && process.env.ADMIN_EMAIL && effectiveEmail === process.env.ADMIN_EMAIL.toLowerCase()) {
    await prisma.user.create({ data: { authId: authId, email: effectiveEmail, name: effectiveName, approved: true, role: 'ADMIN' } })
    return NextResponse.json({ ok: true })
  }

  // Otherwise create join request (use effective values). This covers both fresh users and fallback client-posted values.
  try {
    const existsReq2 = await prisma.joinRequest.findFirst({ where: { authId: effectiveAuthId } })
    if (!existsReq2) {
      await prisma.joinRequest.create({ data: { authId: effectiveAuthId, email: effectiveEmail, name: effectiveName } })
    }
  } catch (e: any) {
    // ignore create conflicts
  }
  return NextResponse.json({ pending: true })
}
