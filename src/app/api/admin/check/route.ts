import { NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { requireAdminByAuthId } from '@/lib/auth'

export async function GET(req: Request) {
  const a: any = getAuth({ headers: headers() } as any)
  const authId = a?.userId || null
  const email = (a?.user?.emailAddresses && a.user.emailAddresses[0]?.emailAddress) || a?.user?.primaryEmailAddress?.emailAddress || null
  try {
    await requireAdminByAuthId(authId, email)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'unauthorized' }, { status: 401 })
  }
}
