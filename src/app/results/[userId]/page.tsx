'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface ResultData {
  score: number
  total: number
}

export default function ResultsPage({ params }: { params: { userId: string } }) {
  const [result, setResult] = useState<ResultData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/exam/attempt?userId=${params.userId}`)
      .then(res => res.json())
      .then(data => {
        setResult(data)
        setLoading(false)
      })
  }, [params.userId])

  if (loading) return <p>Loading...</p>
  if (!result) return <p>No results found.</p>

  const percentage = Math.round((result.score / result.total) * 100)

  return (
    <div>
      <h1>Your Score</h1>
      <p>{result.score} / {result.total}</p>
      <p>{percentage}%</p>
      <Link href="/leaderboard">
        View Leaderboard
      </Link>
    </div>
  )
}
