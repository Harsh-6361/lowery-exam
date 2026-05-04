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

  const toggleWinner = async (teamId: number) => {
    const response = await fetch(`/api/teams/${teamId}/winner`, {
      method: 'POST',
    })
    const updatedTeam = await response.json()

    if (response.ok) {
      setTeams(teams.map(team =>
        team.id === teamId ? { ...team, isWinner: updatedTeam.isWinner } : team
      ))
    }
  }

  if (loading) return <p>Loading...</p>
  if (teams.length === 0) return <p>No teams found.</p>

  return (
    <div>
      {teams.map(team => (
        <div key={team.teamNumber}>
          <h3>Team {team.teamNumber}</h3>
          <button
            onClick={() => toggleWinner(team.id)}
            style={{ backgroundColor: team.isWinner ? 'gold' : 'gray' }}
          >
            {team.isWinner ? 'Winner' : 'Mark as Winner'}
          </button>
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
