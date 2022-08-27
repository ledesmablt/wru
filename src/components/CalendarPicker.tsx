import dayjs from 'dayjs'
import { useSession } from 'next-auth/react'
import React, { ReactElement, useState } from 'react'
import { trpc } from '../utils/trpc'

const CalendarPicker = (): ReactElement => {
  const { data: session } = useSession()

  const [calendarId, setCalendarId] = useState('')
  const { data: calendars } = trpc.useQuery(['google.calendar.list'], {
    enabled: !!session?.user
  })

  const { data: events } = trpc.useQuery(
    [
      'google.calendar.events',
      {
        calendarId
      }
    ],
    {
      enabled: !!calendarId
    }
  )

  return (
    <>
      {!!calendars?.length && (
        <div className='mt-4'>
          <p className='font-bold'>Calendars</p>
          {calendars?.map((calendar) => {
            return (
              <div key={calendar.id}>
                <button
                  onClick={() => calendar.id && setCalendarId(calendar.id)}
                >
                  {calendar.summary}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {!!events?.length && (
        <div>
          <p className='font-bold'>Events</p>
          {events?.map((event) => {
            return (
              <div key={event.id}>
                {event.summary || '(untitled event)'}:{' '}
                {dayjs(event.originalStartTime?.dateTime).format('MM/DD/YYYY')}
                {event.location && `at ${event.location}`}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
export default CalendarPicker
