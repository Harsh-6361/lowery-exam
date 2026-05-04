export interface TeamMember {
  name: string
  branch: string
  rank: number
}

export interface Team {
  teamNumber: number
  members: TeamMember[]
}

export function generateTeams(
  leaderboard: { name: string; branch: string; rank: number }[],
  numberOfTeams: number,
  membersPerTeam: number
): Team[] {
  const totalNeeded = numberOfTeams * membersPerTeam
  const topParticipants = leaderboard.slice(0, totalNeeded)

  // Split into columns
  const columns: number[][] = []
  for (let col = 0; col < membersPerTeam; col++) {
    const columnData: number[] = []
    for (let row = 0; row < numberOfTeams; row++) {
      const index = row * membersPerTeam + col
      if (index < topParticipants.length) {
        columnData.push(index)
      }
    }
    
    // Reverse every other column (0-indexed: 1, 3, 5, ...)
    if (col % 2 === 1) {
      columnData.reverse()
    }
    
    columns.push(columnData)
  }

  // Form teams by taking one element from each column per row
  const teams: Team[] = []
  for (let row = 0; row < numberOfTeams; row++) {
    const members: TeamMember[] = []
    for (let col = 0; col < membersPerTeam; col++) {
      const participantIndex = columns[col][row]
      if (participantIndex !== undefined) {
        const participant = topParticipants[participantIndex]
        members.push({
          name: participant.name,
          branch: participant.branch,
          rank: participant.rank
        })
      }
    }
    teams.push({
      teamNumber: row + 1,
      members
    })
  }

  return teams
}
