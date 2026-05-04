import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const questions = await prisma.question.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(questions)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { questionText, options, correctOptionIndex } = body

  const question = await prisma.question.create({
    data: {
      questionText,
      options,
      correctOptionIndex,
    },
  })

  return NextResponse.json(question)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  await prisma.question.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true })
}
