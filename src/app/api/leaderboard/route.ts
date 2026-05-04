import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const attempts = await prisma.examAttempt.findMany({
    include: { user: true },
    orderBy: { score: 'desc' },
  })

  return NextResponse.json(
    attempts.map((attempt, index) => ({
      rank: index + 1,
      name: attempt.user.name,
      branch: attempt.user.branch,
      rollNumber: attempt.user.rollNumber,
      score: attempt.score,
    }))
  )
}
