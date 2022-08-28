import type { NextPage } from 'next'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import Timeline from '../components/Timeline'

const Home: NextPage = () => {
  const { data: session } = useSession()

  return (
    <main className='container mx-auto flex flex-col items-center justify-center min-h-screen p-4'>
      <h1 className='text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700'>
        WRU
      </h1>

      {session?.user ? (
        <>
          <Link href='/user/profile'>my profile</Link>
          <div className='my-2' />
          <Timeline />
        </>
      ) : (
        <>
          <button onClick={() => signIn()}>sign in</button>
        </>
      )}
    </main>
  )
}

export default Home
