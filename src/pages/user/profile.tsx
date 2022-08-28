import type { NextPage } from 'next'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import CalendarPicker from '../../components/CalendarPicker'
import { trpc } from '../../utils/trpc'

const UserProfile: NextPage = () => {
  const router = useRouter()

  const { data: session } = useSession({
    required: true,
    onUnauthenticated: () => router.push('/')
  })
  const { mutateAsync: authorizeGoogle } = trpc.useMutation('google.authorize')

  const [calendarPickerOpen, setCalendarPickerOpen] = useState(false)

  if (!session?.user) {
    return null
  }

  return (
    <main className='container mx-auto flex flex-col items-center justify-center min-h-screen p-4'>
      <p>Logged in as {session.user.name}</p>
      <img
        referrerPolicy='no-referrer'
        src={session.user.image || ''}
        alt=''
        className='w-12 h-12 rounded-full'
      />
      <button onClick={() => setCalendarPickerOpen((v) => !v)}>
        pick calendar
      </button>
      {calendarPickerOpen && <CalendarPicker />}
      <button
        onClick={async () => {
          const url = await authorizeGoogle()
          router.replace(url)
        }}
      >
        authorize
      </button>

      <button onClick={() => signOut()}>sign out</button>
    </main>
  )
}

export default UserProfile
