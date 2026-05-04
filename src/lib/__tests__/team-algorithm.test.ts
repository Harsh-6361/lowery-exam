import { generateTeams } from '../team-algorithm'

const mockLeaderboard = Array.from({ length: 100 }, (_, i) => ({
  name: `Student ${i + 1}`,
  branch: 'CSE',
  rank: i + 1
}))

describe('generateTeams', () => {
  it('should generate correct teams for 9 teams with 3 members each', () => {
    const teams = generateTeams(mockLeaderboard, 9, 3)
    
    expect(teams).toHaveLength(9)
    expect(teams[0].members).toEqual([
      { name: 'Student 1', branch: 'CSE', rank: 1 },
      { name: 'Student 18', branch: 'CSE', rank: 18 },
      { name: 'Student 19', branch: 'CSE', rank: 19 }
    ])
    expect(teams[8].members).toEqual([
      { name: 'Student 9', branch: 'CSE', rank: 9 },
      { name: 'Student 10', branch: 'CSE', rank: 10 },
      { name: 'Student 27', branch: 'CSE', rank: 27 }
    ])
  })

  it('should handle partial last column', () => {
    const teams = generateTeams(mockLeaderboard.slice(0, 25), 9, 3)
    expect(teams).toHaveLength(9)
  })
})
