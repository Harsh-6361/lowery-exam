import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  const state = await prisma.examState.update({
    where: { id: 1 },
    data: { isEnded: true },
  })

  return NextResponse.json(state)
}
