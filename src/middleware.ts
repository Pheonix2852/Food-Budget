import { clerkMiddleware } from '@clerk/nextjs/server'

// Assign the clerk middleware to a const so we can export it both as the default
// and as a named `middleware` export. This helps runtime detection in some
// environments and gives a single reference for Next/Clerk to find.
const mw = clerkMiddleware()

// Log on module evaluation to help confirm the middleware module is loaded
// in the dev server logs.
console.log('[src/middleware] clerk middleware initialized')

export default mw
export const middleware = mw

export const config = {
  // Ensure middleware runs for the root path `/` too.
  // Removing the accidental `$` from the negative lookahead so `/` isn't excluded.
  matcher: [
  '/((?!_next/static|_next/image|favicon.ico|api/(?:webhooks|public)).*)',
  ],
}
