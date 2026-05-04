import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateTeams } from '@/lib/team-algorithm'

export async function POST(request: Request) {
  const body = await request.json()
  const { numberOfTeams, membersPerTeam } = body

  if (!numberOfTeams || !membersPerTeam) {
    return NextResponse.json(
      { error: 'numberOfTeams and membersPerTeam are required' },
      { status: 400 }
    )
  }

  const attempts = await prisma.examAttempt.findMany({
    include: { user: true },
    orderBy: { score: 'desc' },
  })

  const leaderboard = attempts.map((attempt, index) => ({
    name: attempt.user.name,
    branch: attempt.user.branch,
    rank: index + 1,
  }))

  const teams = generateTeams(leaderboard, numberOfTeams, membersPerTeam)

  await prisma.team.deleteMany()

  for (const team of teams) {
    await prisma.team.create({
      data: {
        teamNumber: team.teamNumber,
        members: team.members as any,
      },
    })
  }

  return NextResponse.json(teams)
}
