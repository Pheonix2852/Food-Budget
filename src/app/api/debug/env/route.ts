import { NextResponse } from 'next/server'

export async function GET() {
  // Do NOT return secret values. Return only presence booleans to help debug prod env wiring.
  const hasPublishable = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
  const hasSecret = Boolean(process.env.CLERK_SECRET || process.env.CLERK_API_KEY || process.env.CLERK_SECRET_KEY)

  return NextResponse.json({
    ok: true,
    env: {
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: hasPublishable,
      CLERK_SECRET_present: hasSecret,
    },
    note: 'This endpoint only reports whether key(s) are present, it never exposes values.'
  })
}
