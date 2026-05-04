import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, branch, rollNumber, course, semesterYear, email, contactNumber } = body

    // Check unique constraints
    const existingName = await prisma.user.findUnique({ where: { name } })
    if (existingName) {
      return NextResponse.json({ error: 'Name already exists' }, { status: 400 })
    }

    const existingRoll = await prisma.user.findUnique({ where: { rollNumber } })
    if (existingRoll) {
      return NextResponse.json({ error: 'Roll number already exists' }, { status: 400 })
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    const user = await prisma.user.create({
      data: {
        name,
        branch,
        rollNumber,
        course,
        semesterYear,
        email,
        contactNumber,
      },
    })

    return NextResponse.json({ userId: user.id })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
  }
}
