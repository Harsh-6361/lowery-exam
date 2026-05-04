import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const userId = parseInt(url.searchParams.get('userId') || '0')

  const attempt = await prisma.examAttempt.findUnique({
    where: { userId },
  })

  if (!attempt) return NextResponse.json(null)

  const total = await prisma.question.count()

  return NextResponse.json({ score: attempt.score, total })
}
