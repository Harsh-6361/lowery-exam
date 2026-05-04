import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const body = await request.json()
  const { userId, answers } = body

  const questions = await prisma.question.findMany()

  let score = 0
  for (const q of questions) {
    if (answers[q.id] === q.correctOptionIndex) {
      score++
    }
  }

  const existing = await prisma.examAttempt.findUnique({
    where: { userId: parseInt(userId) },
  })

  if (existing) {
    await prisma.examAttempt.update({
      where: { id: existing.id },
      data: { answers, score, submittedAt: new Date() },
    })
  } else {
    await prisma.examAttempt.create({
      data: {
        userId: parseInt(userId),
        answers,
        score,
      },
    })
  }

  return NextResponse.json({ score, total: questions.length })
}
