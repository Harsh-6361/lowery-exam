import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const body = await request.json()
  const { showLeaderboard, showTeams } = body

  let state = await prisma.examState.findFirst()

  const updateData: any = {}
  if (showLeaderboard !== undefined) updateData.showLeaderboard = showLeaderboard
  if (showTeams !== undefined) updateData.showTeams = showTeams

  if (!state) {
    state = await prisma.examState.create({
      data: {
        id: 1,
        isStarted: false,
        isEnded: false,
        showLeaderboard: showLeaderboard || false,
        showTeams: showTeams || false,
      },
    })
  } else {
    state = await prisma.examState.update({
      where: { id: 1 },
      data: updateData,
    })
  }

  return NextResponse.json(state)
}
