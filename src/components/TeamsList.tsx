'use client'

import { useState, useEffect } from 'react'

export default function TeamsList() {
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/teams')
      .then(res => res.json())
      .then(data => {
        setTeams(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <p>Loading...</p>
  if (teams.length === 0) return <p>No teams found.</p>

  return (
    <div>
      {teams.map(team => (
        <div key={team.teamNumber}>
          <h3>Team {team.teamNumber}</h3>
          <ul>
            {team.members.map((m: any, i: number) => (
              <li key={i}>{m.name} - {m.branch} (Rank {m.rank})</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
