import { NextResponse } from 'next/server'
import { getMealCountForDate } from '@/lib/mealcount'
import { getAuth } from '@clerk/nextjs/server'
import { requireUserByAuthId } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const date = url.searchParams.get('date')
    if (!date) return NextResponse.json({ error: 'missing date param' }, { status: 400 })

    const data = await getMealCountForDate(date)
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
