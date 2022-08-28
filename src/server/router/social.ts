import dayjs from 'dayjs'
import { z } from 'zod'
import { createProtectedRouter } from './protected-router'

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
    async resolve({ ctx }) {
      // TODO: cache results
      const { user } = ctx.session
      const following = await ctx.prisma.userFollow.findMany({
        where: { fromUserId: user.id }
      })
      const activities = await ctx.prisma.activity.findMany({
        where: {
          userId: {
            in: [user.id, ...following.map((u) => u.id)]
          },
          startDateTime: {
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
              name: true,
              image: true
            }
          }
        }
      })

      return activities
    }
  })
