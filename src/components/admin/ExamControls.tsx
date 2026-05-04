'use client'

import { useState, useEffect } from 'react'

export default function ExamControls() {
  const [status, setStatus] = useState<{ isStarted: boolean; isEnded: boolean } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/exam/state')
      .then(res => res.json())
      .then(data => setStatus(data))
  }, [])

  const handleStart = async () => {
    setLoading(true)
    const res = await fetch('/api/exam/start', { method: 'POST' })
    const data = await res.json()
    setStatus(data)
    setLoading(false)
  }

  const handleEnd = async () => {
    setLoading(true)
    const res = await fetch('/api/exam/end', { method: 'POST' })
    const data = await res.json()
    setStatus(data)
    setLoading(false)
  }

  if (!status) return <div>Loading...</div>

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Exam Controls</h2>
      <div className="mb-4">
        Status: <span className="font-medium">
          {status.isEnded ? 'Exam Ended' : status.isStarted ? 'Exam Started' : 'Exam Not Started'}
        </span>
      </div>
      <div className="flex gap-4">
        <button
          onClick={handleStart}
          disabled={status.isStarted || loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          Start Exam
        </button>
        <button
          onClick={handleEnd}
          disabled={!status.isStarted || status.isEnded || loading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
        >
          End Exam
        </button>
      </div>
    </div>
  )
}
