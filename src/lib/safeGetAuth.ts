import { getAuth } from '@clerk/nextjs/server'

/**
 * safeGetAuth wraps Clerk's getAuth and returns an empty object
 * when the Clerk middleware hasn't run (prevents unhandled runtime errors).
 * It rethrows other unexpected errors.
 */
export function safeGetAuth(req?: any) {
  try {
    return getAuth(req as any)
  } catch (err: any) {
    const msg = String(err?.message || '')
    if (msg.includes('clerkMiddleware') || msg.includes("auth() was called but Clerk")) {
      // Middleware not detected -> treat as no auth instead of crashing.
      return {} as any
    }
    throw err
  }
}
