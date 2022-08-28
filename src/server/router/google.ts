import { z } from 'zod'
import { createProtectedRouter } from './protected-router'

import { calendar_v3, google } from 'googleapis'
import { env } from '../../env/server.mjs'
import dayjs from 'dayjs'
import { Activity } from '@prisma/client'

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
        expiry_date: z.number().transform((v) => new Date(v)),
        id_token: z.string().optional()
      })
      const googleCreds = schema.parse(res.tokens)

      // NOTE: should encrypt this for security
      await ctx.prisma.googleCredentials.create({
        data: {
          code: input.code,
          ...googleCreds,
          userId: user.id,
          updatedAt: new Date()
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
    authClient.setCredentials({
      ...creds,
      expiry_date: creds.expiry_date?.getTime()
    })
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
  .mutation('calendar.sync', {
    input: z.object({
      calendarId: z.string()
    }),
    async resolve({ input, ctx }) {
      // TODO: rate limit this
      const now = dayjs()
      const { data } = await google
        .calendar({
          version: 'v3',
          auth: ctx.authClient
        })
        .events.list({
          singleEvents: true,
          showDeleted: true,
          calendarId: input.calendarId,
          timeMin: now.toISOString(),
          timeMax: now.add(2, 'weeks').toISOString()
        })

      const events = data.items?.filter((e) => !!e.start?.dateTime)
      if (!events?.length) {
        return 0
      }

      const existing = await ctx.prisma.activity.findMany({
        where: {
          googleCalendarEventId: {
            in: events.map((e) => e.id as string)
          }
        }
      })
      const existingMap = existing.reduce<{ [k: string]: Activity }>(
        (obj, e) => {
          if (!e.googleCalendarEventId) {
            return obj
          }
          obj[e.googleCalendarEventId] = e
          return obj
        },
        {}
      )

      const formatter = (event: calendar_v3.Schema$Event) => {
        if (event.location) {
          // TODO: handle location
        }
        const schema = z.object({
          userId: z.string(),
          type: z.string(),
          startDateTime: z.date(),
          endDateTime: z.date(),
          title: z.string(),
          description: z.string().nullish(),
          locationId: z.string().nullish(),
          googleCalendarEventId: z.string(),
          updatedAt: z.date()
        })
        const parsedEvent = schema.parse({
          userId: ctx.session.user.id,
          type: 'Other',
          startDateTime: new Date(event.start?.dateTime as string),
          endDateTime: new Date(event.end?.dateTime as string),
          title: event.summary || 'Untitled event',
          description: event.description,
          googleCalendarEventId: event.id,
          updatedAt: new Date()
        })
        return parsedEvent
      }

      const toCreate: ReturnType<typeof formatter>[] = []
      const toDelete: string[] = []
      const toUpdate: { id: string; body: ReturnType<typeof formatter> }[] = []
      for (const event of events) {
        if (!event.id) {
          continue
        }
        const existingActivity = existingMap[event.id]
        const body = formatter(event)
        if (existingActivity) {
          if (event.status === 'confirmed') {
            toUpdate.push({
              id: existingActivity.id,
              body
            })
          } else {
            // delete non-confirmed events
            toDelete.push(event.id)
          }
        } else {
          toCreate.push(body)
        }
      }

      if (toCreate.length) {
        await ctx.prisma.activity.createMany({
          data: toCreate
        })
      }
      if (toDelete.length) {
        await ctx.prisma.activity.deleteMany({
          where: {
            googleCalendarEventId: { in: toDelete }
          }
        })
      }
      if (toUpdate.length) {
        await Promise.all(
          toUpdate.map(({ id, body }) =>
            ctx.prisma.activity.update({
              where: { id },
              data: body
            })
          )
        )
      }
      return events.length
    }
  })
