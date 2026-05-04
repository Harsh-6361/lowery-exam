'use client'

import { useState } from 'react'

export default function TeamGenerator() {
  const [numberOfTeams, setNumberOfTeams] = useState('')
  const [membersPerTeam, setMembersPerTeam] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    const res = await fetch('/api/teams/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numberOfTeams: parseInt(numberOfTeams),
        membersPerTeam: parseInt(membersPerTeam),
      }),
    })
    if (!res.ok) {
      setError('Error generating teams')
    }
  }

  return (
    <div>
      <label>
        Number of Teams
        <input
          type="number"
          value={numberOfTeams}
          onChange={(e) => setNumberOfTeams(e.target.value)}
        />
      </label>
      <label>
        Members per Team
        <input
          type="number"
          value={membersPerTeam}
          onChange={(e) => setMembersPerTeam(e.target.value)}
        />
      </label>
      <button onClick={handleSubmit}>Generate Teams</button>
      {error && <p>{error}</p>}
    </div>
  )
}
