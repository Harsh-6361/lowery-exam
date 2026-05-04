import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  let state = await prisma.examState.findFirst()

  if (!state) {
    state = await prisma.examState.create({
      data: { id: 1, isStarted: true, isEnded: false },
    })
  } else {
    state = await prisma.examState.update({
      where: { id: 1 },
      data: { isStarted: true, isEnded: false },
    })
  }

  return NextResponse.json(state)
}
