import * as srcMw from './src/middleware'

// Re-export the middleware so Clerk can detect it when middleware is loaded at the repo root.
export const middleware = srcMw.middleware
export const config = srcMw.config
export default srcMw.default

