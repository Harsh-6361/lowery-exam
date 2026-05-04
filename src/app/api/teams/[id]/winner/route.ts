import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const team = await prisma.team.findUnique({
    where: { id: parseInt(params.id) },
  })

  if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 })

  const updated = await prisma.team.update({
    where: { id: team.id },
    data: { isWinner: !team.isWinner },
  })

  return NextResponse.json(updated)
}
