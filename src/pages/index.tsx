import type { NextPage } from 'next'
import { signIn, signOut, useSession } from 'next-auth/react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { trpc } from '../utils/trpc'

const Home: NextPage = () => {
  const router = useRouter()

  // TODO: move this to another frontend route
  const { mutateAsync: googleGetTokens } = trpc.useMutation(
    'google.authorize.getTokens'
  )
  const googleCode = router.query.code as string
  useEffect(() => {
    const f = async () => {
      if (googleCode) {
        try {
          await googleGetTokens({
            code: googleCode
          })
        } catch (err) {
          console.error(err)
        } finally {
          router.replace('/')
        }
      }
    }
    f()
  }, [googleCode, googleGetTokens, router])

  const { data: calendars } = trpc.useQuery(['google.calendar.list'])

  const { data: session } = useSession()
  const { mutateAsync: authorizeGoogle } = trpc.useMutation('google.authorize')

  return (
    <>
      <Head>
        <title>WRU</title>
      </Head>

      <main className='container mx-auto flex flex-col items-center justify-center min-h-screen p-4'>
        <h1 className='text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700'>
          WRU
        </h1>

        {session?.user ? (
          <>
            <p>Logged in as {session.user.name}</p>
            <img
              referrerPolicy='no-referrer'
              src={session.user.image || ''}
              alt=''
              className='w-12 h-12 rounded-full'
            />
            <button
              onClick={async () => {
                const url = await authorizeGoogle()
                router.replace(url)
              }}
            >
              authorize
            </button>
            <button onClick={() => signOut()}>sign out</button>
          </>
        ) : (
          <>
            <button onClick={() => signIn()}>sign in</button>
          </>
        )}

        {calendars?.length && (
          <div className='mt-4'>
            <p className='font-bold'>Calendars</p>
            {calendars?.map((calendar) => {
              return <div key={calendar.id}>{calendar.summary}</div>
            })}
          </div>
        )}
      </main>
    </>
  )
}

export default Home
