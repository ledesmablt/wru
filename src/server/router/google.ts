import { z } from 'zod'
import { createProtectedRouter } from './protected-router'

import { google } from 'googleapis'
import { env } from '../../env/server.mjs'

const authClient = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.NEXTAUTH_URL
)

const scopes = ['https://www.googleapis.com/auth/calendar']

export const googleRouter = createProtectedRouter()
  .mutation('authorize', {
    async resolve() {
      const url = authClient.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes
      })
      return url
    }
  })
  .mutation('authorize.getTokens', {
    input: z.object({
      code: z.string()
    }),
    async resolve({ ctx, input }) {
      const { user } = ctx.session
      const res = await authClient.getToken(input.code)
      const schema = z.object({
        access_token: z.string(),
        refresh_token: z.string(),
        scope: z.string(),
        token_type: z.string(),
        expiry_date: z.number(),
        id_token: z.string().optional()
      })
      const googleCreds = schema.parse(res.tokens)

      await ctx.prisma.googleCredentials.create({
        data: {
          code: input.code,
          ...googleCreds,
          userId: user.id,
          updatedAt: Date.now()
        }
      })
      return true
    }
  })
  .query('calendar.list', {
    async resolve({ ctx }) {
      const { user } = ctx.session
      return []
    }
  })
