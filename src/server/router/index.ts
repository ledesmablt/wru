// src/server/router/index.ts
import { createRouter } from './context'
import superjson from 'superjson'

import { googleRouter, googleAuthorizedRouter } from './google'

export const appRouter = createRouter()
  .transformer(superjson)
  .merge('google.', googleRouter)
  .merge('google.', googleAuthorizedRouter)

// export type definition of API
export type AppRouter = typeof appRouter
