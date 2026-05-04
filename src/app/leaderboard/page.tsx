'use client'

import Leaderboard from '@/components/Leaderboard'
import { useEffect, useState } from 'react'

export default function LeaderboardPage() {
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/exam/state')
      .then(res => res.json())
      .then(data => {
        setShowLeaderboard(data.showLeaderboard || false)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading...</div>

  if (!showLeaderboard) return <div>Leaderboard is not available at this time.</div>

  return (
    <div>
      <h1>Leaderboard</h1>
      <Leaderboard />
    </div>
  )
}
