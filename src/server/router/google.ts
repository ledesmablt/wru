import { z } from 'zod'
import { createProtectedRouter } from './protected-router'

import { google } from 'googleapis'
import { env } from '../../env/server.mjs'
import dayjs from 'dayjs'

const getAuthClient = () =>
  new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.NEXTAUTH_URL
  )

const scopes = ['https://www.googleapis.com/auth/calendar']

export const googleRouter = createProtectedRouter()
  .mutation('authorize', {
    async resolve() {
      const url = getAuthClient().generateAuthUrl({
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
      const res = await getAuthClient().getToken(input.code)
      const schema = z.object({
        access_token: z.string(),
        refresh_token: z.string(),
        scope: z.string(),
        token_type: z.string(),
        expiry_date: z.number(),
        id_token: z.string().optional()
      })
      const googleCreds = schema.parse(res.tokens)

      // NOTE: should encrypt this for security
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

export const googleAuthorizedRouter = createProtectedRouter()
  .middleware(async ({ ctx, next }) => {
    const { user } = ctx.session
    const authClient = getAuthClient()
    const creds = await ctx.prisma.googleCredentials.findUnique({
      where: { userId: user.id }
    })
    if (!creds) {
      throw new Error('Not yet authenticated with Google')
    }
    authClient.setCredentials(creds)
    return next({
      ctx: {
        ...ctx,
        authClient
      }
    })
  })
  .query('calendar.list', {
    async resolve({ ctx }) {
      const { data } = await google
        .calendar({
          version: 'v3',
          auth: ctx.authClient
        })
        .calendarList.list()
      return data.items?.filter((cal) => cal.accessRole === 'owner')
    }
  })
  .query('calendar.events', {
    input: z.object({
      calendarId: z.string()
    }),
    async resolve({ input, ctx }) {
      const now = dayjs()
      const { data } = await google
        .calendar({
          version: 'v3',
          auth: ctx.authClient
        })
        .events.list({
          singleEvents: true,
          showDeleted: false,
          calendarId: input.calendarId,
          timeMin: now.toISOString(),
          timeMax: now.add(2, 'weeks').toISOString()
        })
      return data.items
    }
  })
  .mutation('calendar.pull', {
    input: z.object({
      calendarId: z.string()
    }),
    async resolve({ input, ctx }) {
      const now = dayjs()
      const { data } = await google
        .calendar({
          version: 'v3',
          auth: ctx.authClient
        })
        .events.list({
          singleEvents: true,
          showDeleted: false,
          calendarId: input.calendarId,
          timeMin: now.toISOString(),
          timeMax: now.add(2, 'weeks').toISOString()
        })
      return data.items
    }
  })
