import dayjs from 'dayjs'
import { NextPage } from 'next'
import { useMemo } from 'react'
import { trpc } from '../utils/trpc'
import _ from 'lodash'

const Timeline: NextPage = () => {
  const { data, isLoading } = trpc.useQuery(['social.timeline.upcoming'])

  const groupedActivities = useMemo(() => {
    return _.groupBy(data || [], (a) =>
      dayjs(a.startDateTime).startOf('day').toISOString()
    )
  }, [data])

  const today = useMemo(() => dayjs().startOf('day'), [])

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
    <div className='flex flex-col gap-4'>
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
            {activities.map((activity) => {
              return (
                <>
                  <p className='text-lg'>{activity.title}</p>
                  {activity.location && ` at ${activity.location.name}`}
                </>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default Timeline
