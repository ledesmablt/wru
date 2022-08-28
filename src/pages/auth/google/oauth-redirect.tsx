import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { trpc } from '../../../utils/trpc'
import { useEffect, useState } from 'react'

const GoogleOAuthRedirect: NextPage = () => {
  const router = useRouter()
  const { mutateAsync: googleGetTokens } = trpc.useMutation(
    'google.authorize.getTokens'
  )

  const googleCode = router.query.code as string

  const [message, setMessage] = useState('handling your google integration...')

  useEffect(() => {
    const f = async () => {
      if (googleCode) {
        try {
          await googleGetTokens({
            code: googleCode
          })
          setMessage('success! redirecting you back to home...')
        } catch (err) {
          console.error(err)
          setMessage('something went wrong! redirecting you back to home...')
        }
      }
      setTimeout(() => {
        router.replace('/')
      }, 2000)
    }
    if (router.isReady) {
      f()
    }
  }, [googleCode, googleGetTokens, router])

  return <div>{message}</div>
}

export default GoogleOAuthRedirect
