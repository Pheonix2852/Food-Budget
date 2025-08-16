import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const auth = request.headers.get('authorization') || '';
  const secret = process.env.CRON_SECRET || '';

  // Vercel sets the Authorization header to "Bearer <secret>" for cron jobs
  if (auth !== `Bearer ${secret}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // TODO: Put the actual cron logic here (archive old data, run nightly jobs, etc.)
  // Keep the handler lightweight and idempotent.

  return NextResponse.json({ ok: true });
}
