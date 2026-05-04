'use client'

import { useEffect, useState } from 'react'

interface LeaderboardEntry {
  rank: number
  name: string
  branch: string
  rollNumber: string
  score: number
}

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <p>Loading...</p>
  if (data.length === 0) return <p>No results yet.</p>

  return (
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Name</th>
          <th>Branch</th>
          <th>Roll Number</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {data.map(entry => (
          <tr key={entry.rank}>
            <td>{entry.rank}</td>
            <td>{entry.name}</td>
            <td>{entry.branch}</td>
            <td>{entry.rollNumber}</td>
            <td>{entry.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
