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
  const { data: isGoogleAuthorized } = trpc.useQuery(['google.isAuthorized'])
  const { mutateAsync: authorizeGoogle } = trpc.useMutation('google.getAuthUrl')
  const followMutation = trpc.useMutation('social.follow', {
    onSuccess: () => {
      setFollowEmail('')
    }
  })

  const [calendarPickerOpen, setCalendarPickerOpen] = useState(false)
  const [followEmail, setFollowEmail] = useState('')

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
      {isGoogleAuthorized ? (
        <>
          <button onClick={() => setCalendarPickerOpen((v) => !v)}>
            pick calendar
          </button>
          {calendarPickerOpen && <CalendarPicker />}
        </>
      ) : (
        <button
          onClick={async () => {
            const url = await authorizeGoogle()
            router.replace(url)
          }}
        >
          authorize google
        </button>
      )}
      <div className='flex my-2 gap-2 items-center'>
        <input
          disabled={followMutation.isLoading}
          className='border p-1'
          placeholder='user email to follow'
          type='text'
          value={followEmail}
          onChange={(e) => setFollowEmail(e.target.value)}
        />
        <button
          className='border p-1'
          disabled={!followEmail && followMutation.isLoading}
          onClick={() =>
            followMutation.mutate({
              email: followEmail
            })
          }
        >
          follow
        </button>
      </div>
      {followMutation.isSuccess && <p>OK!</p>}
      {followMutation.error && <p>{followMutation.error.message}</p>}

      <button onClick={() => signOut()}>sign out</button>
    </main>
  )
}

export default UserProfile
