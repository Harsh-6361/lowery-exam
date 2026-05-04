import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const problems = await prisma.problemStatement.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(problems)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { title, description } = body

  const problem = await prisma.problemStatement.create({
    data: {
      title,
      description,
    },
  })

  return NextResponse.json(problem)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  await prisma.problemStatement.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true })
}
