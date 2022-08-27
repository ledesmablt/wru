import type { NextPage } from 'next'
import { signIn, signOut, useSession } from 'next-auth/react'
import Head from 'next/head'
import { trpc } from '../utils/trpc'

const Home: NextPage = () => {
  const { data: trpcHello } = trpc.useQuery([
    'example.hello',
    { text: 'from tRPC' }
  ])
  const { data: session } = useSession()

  console.log(trpcHello?.greeting)

  return (
    <>
      <Head>
        <title>WRU</title>
      </Head>

      <main className='container mx-auto flex flex-col items-center justify-center min-h-screen p-4'>
        <h1 className='text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700'>
          WRU
        </h1>

        {session ? (
          <div>
            <p>Logged in as {session?.user?.name}</p>
            <button onClick={() => signOut()}>sign out</button>
          </div>
        ) : (
          <div>
            <button onClick={() => signIn()}>sign in</button>
          </div>
        )}
      </main>
    </>
  )
}

export default Home
