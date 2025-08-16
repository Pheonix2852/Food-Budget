import { NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'

export async function GET(req: Request) {
  const a: any = getAuth({ headers: (req as any).headers } as any)
  return NextResponse.json({ userId: a.userId, user: a.user || null })
}
