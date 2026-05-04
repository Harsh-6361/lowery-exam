import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const state = await prisma.examState.findFirst()
  const questionCount = await prisma.question.count()
  const userCount = await prisma.user.count()

  return NextResponse.json({
    isStarted: state?.isStarted || false,
    isEnded: state?.isEnded || false,
    questionCount,
    userCount,
  })
}
