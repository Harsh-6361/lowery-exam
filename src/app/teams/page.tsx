'use client'

import TeamsList from '@/components/TeamsList'
import { useEffect, useState } from 'react'

export default function TeamsPage() {
  const [showTeams, setShowTeams] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/exam/state')
      .then(res => res.json())
      .then(data => {
        setShowTeams(data.showTeams || false)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading...</div>

  if (!showTeams) return <div>Teams are not available at this time.</div>

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Teams</h1>
      <TeamsList />
    </div>
  )
}
