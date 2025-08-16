// Re-export the middleware from `src/middleware.ts` so environments that expect a
// top-level `middleware.(ts|js)` can detect Clerk's middleware.
// Re-export named exports from src/middleware so Next/Clerk can detect them.
// Re-export middleware and config from src/middleware so Clerk/Next detect it
export { middleware, default as defaultMiddleware, config } from './src/middleware'

// Also export default as the named middleware export (some runtimes expect both)
export { middleware as default } from './src/middleware'
