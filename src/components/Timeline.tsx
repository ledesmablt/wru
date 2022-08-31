import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)

import { NextPage } from 'next'
import { useMemo } from 'react'
import { trpc } from '../utils/trpc'
import _ from 'lodash'
import { useSession } from 'next-auth/react'

const Timeline: NextPage = () => {
  const { data: session } = useSession()
  const { data, isLoading } = trpc.useQuery([
    'social.timeline.upcoming',
    {
      timeZone: dayjs.tz.guess()
    }
  ])

  const groupedActivities = useMemo(() => {
    return _.groupBy(data || [], (a) =>
      dayjs(a.startDateTime).startOf('day').toISOString()
    )
  }, [data])

  const today = useMemo(() => dayjs().startOf('day'), [])

  if (!session?.user) {
    return null
  }

  if (isLoading) {
    return <p>loading timeline...</p>
  }

  if (!Object.keys(groupedActivities).length) {
    return (
      <p>
        you have no activities on your timeline! go to your profile and sync up
      </p>
    )
  }

  return (
    <div className='flex flex-col gap-8'>
      {Object.entries(groupedActivities).map(([startOfDay, activities]) => {
        const daysFromToday = dayjs(startOfDay).diff(today, 'days')
        let title = `${daysFromToday} days from now`
        if (daysFromToday === 0) {
          title = 'Today'
        } else if (daysFromToday === 1) {
          title = 'Tomorrow'
        }
        return (
          <div key={startOfDay}>
            <p className='font-bold text-xl'>{title}</p>
            <div className='flex flex-col gap-4'>
              {activities.map((activity) => {
                const userName =
                  activity.user.id === session.user?.id
                    ? 'Me'
                    : activity.user.name ?? 'Unknown'
                return (
                  <div key={activity.id}>
                    <p>
                      {userName}: {activity.title}
                    </p>
                    <p>
                      {activity.location && ` at ${activity.location.name}`}
                    </p>
                    {activity.isNearMe && <p>(near me today)</p>}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Timeline
