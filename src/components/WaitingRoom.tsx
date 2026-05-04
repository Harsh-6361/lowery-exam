'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ExamState {
  isStarted: boolean
  isEnded: boolean
  questionCount: number
  userCount: number
}

export default function WaitingRoom({ userId }: { userId: string }) {
  const router = useRouter()
  const [state, setState] = useState<ExamState | null>(null)

  useEffect(() => {
    const poll = async () => {
      const res = await fetch('/api/exam/state')
      const data = await res.json()
      setState(data)

      if (data.isStarted && !data.isEnded) {
        router.push(`/exam/${userId}`)
      }
    }

    poll()
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [userId, router])

  if (!state) return <div>Loading...</div>

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow text-center">
      <h1 className="text-2xl mb-4">Waiting Room</h1>
      <p className="mb-2">Total Questions: {state.questionCount}</p>
      <p className="mb-2">Users Joined: {state.userCount}</p>
      <p className="text-gray-600">Waiting for admin to start exam...</p>
    </div>
  )
}
