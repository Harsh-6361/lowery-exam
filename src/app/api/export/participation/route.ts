import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await prisma.user.findMany();

  const headers = ['Name', 'Branch', 'Roll Number', 'Course', 'Semester/Year', 'Email', 'Contact Number'];
  const csvRows = [headers.join(',')];

  for (const user of users) {
    csvRows.push(
      [user.name, user.branch, user.rollNumber, user.course, user.semesterYear, user.email, user.contactNumber].join(',')
    );
  }

  const csv = csvRows.join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="participation.csv"',
    },
  });
}
