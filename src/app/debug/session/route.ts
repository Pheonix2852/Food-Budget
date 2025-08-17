import { NextResponse } from 'next/server'
import { safeGetAuth } from '@/lib/safeGetAuth'

export async function GET(req: Request) {
  const a: any = safeGetAuth({ headers: (req as any).headers } as any)
  return NextResponse.json({ userId: a.userId, user: a.user || null })
}
