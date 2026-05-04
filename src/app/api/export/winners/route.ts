import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const teams = await prisma.team.findMany({
    orderBy: { teamNumber: 'asc' },
  });

  const headers = ['Team Number', 'Member Names', 'Branch', 'Rank', 'Problem Statement Selected', 'Winner Status'];
  const csvRows = [headers.join(',')];

  for (const team of teams) {
    const members = team.members as any[];
    const memberNames = members.map((m: any) => m.name).join(', ');
    const branches = members.map((m: any) => m.branch).join('/');
    const ranks = members.map((m: any) => m.rank).join('/');
    const winnerStatus = team.isWinner ? 'Yes' : 'No';

    csvRows.push(
      [team.teamNumber, `"${memberNames}"`, branches, ranks, '', winnerStatus].join(',')
    );
  }

  const csv = csvRows.join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="winners.csv"',
    },
  });
}
