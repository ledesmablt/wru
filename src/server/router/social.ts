import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)

import geohash from 'ngeohash'
import { z } from 'zod'
import { createProtectedRouter } from './protected-router'
import { Location } from '@prisma/client'

const GEOHASH_PRECISION = 5

export const socialRouter = createProtectedRouter()
  .mutation('follow', {
    input: z.object({
      email: z.string().email()
    }),
    async resolve({ ctx, input }) {
      const { user } = ctx.session
      if (input.email === user.email) {
        throw new Error("Please provide another user's email")
      }
      const otherUser = await ctx.prisma.user.findUnique({
        where: { email: input.email }
      })
      if (!otherUser) {
        throw new Error(`Invalid email ${input.email}`)
      }
      try {
        await ctx.prisma.userFollow.create({
          data: {
            fromUserId: user.id,
            toUserId: otherUser.id
          }
        })
      } catch (err) {
        // likely bec already following (enforced by unique index)
        return false
      }
      return true
    }
  })
  .mutation('unfollow', {
    input: z.object({
      userId: z.string()
    }),
    async resolve({ ctx, input }) {
      const { user } = ctx.session
      await ctx.prisma.userFollow.delete({
        where: {
          fromUserId_toUserId: {
            fromUserId: user.id,
            toUserId: input.userId
          }
        }
      })
      return true
    }
  })
  .query('timeline.upcoming', {
    input: z.object({
      timeZone: z.string(),
      currentLocation: z
        .object({
          lat: z.number(),
          lng: z.number()
        })
        .nullish()
    }),
    async resolve({ ctx, input }) {
      // TODO: cache results?
      const { user } = ctx.session
      const following = await ctx.prisma.userFollow.findMany({
        where: { fromUserId: user.id }
      })
      const activities = await ctx.prisma.activity.findMany({
        where: {
          userId: {
            in: [user.id, ...following.map((u) => u.toUserId)]
          },
          startDateTime: {
            // TODO: accept pagination params
            gte: new Date(),
            lt: dayjs().add(1, 'week').toDate()
          }
        },
        orderBy: { startDateTime: 'asc' },
        select: {
          id: true,
          type: true,
          title: true,
          description: true,
          startDateTime: true,
          endDateTime: true,
          location: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      })

      const getStartOfDayString = (date: Date) =>
        dayjs(date).tz(input.timeZone).startOf('day').toISOString()
      const myActivities = activities.filter((a) => a.user.id === user.id)
      const myDailyLocations = myActivities.reduce<{
        [date: string]: Location[]
      }>((obj, activity) => {
        if (activity.location) {
          const startOfDay = getStartOfDayString(activity.startDateTime)
          const otherLocationsToday = obj[startOfDay]
          obj[startOfDay] = [...(otherLocationsToday ?? []), activity.location]
        }
        return obj
      }, {})
      const geohashNeighbors = Object.keys(myDailyLocations).reduce<{
        [hash: string]: string[]
      }>((obj, key) => {
        const locations = myDailyLocations[key] as Location[]
        for (const loc of locations) {
          if (!obj[loc.geoHash]) {
            obj[loc.geoHash] = geohash.neighbors(
              loc.geoHash.slice(0, GEOHASH_PRECISION)
            )
          }
        }
        return obj
      }, {})
      const formattedActivities = activities.map((activity) => {
        const formattedActivity = {
          ...activity,
          isNearMe: false
        }
        const isMyActivity = activity.user.id === user.id
        if (!isMyActivity && activity.location) {
          const activityStartOfDay = getStartOfDayString(activity.startDateTime)
          const sameDayLocations = myDailyLocations[activityStartOfDay]
          formattedActivity.isNearMe =
            sameDayLocations?.some((myLocation) => {
              const neighborHashes = geohashNeighbors[myLocation.geoHash] ?? []
              return neighborHashes.some((hash) =>
                activity.location?.geoHash?.startsWith(hash)
              )
            }) || false
        }
        return formattedActivity
      })

      return formattedActivities
    }
  })
