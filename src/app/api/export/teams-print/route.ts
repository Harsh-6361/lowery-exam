import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const teams = await prisma.team.findMany({
    orderBy: { teamNumber: 'asc' },
  });

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Teams List for Judges</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { text-align: center; }
    .team { page-break-inside: avoid; border: 1px solid #ccc; padding: 16px; margin-bottom: 16px; }
    .team-header { font-weight: bold; font-size: 18px; margin-bottom: 8px; }
    .member { margin-left: 16px; }
    .winner { color: green; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Teams List for Judges</h1>
  ${teams.length === 0 ? '<p>No teams found</p>' : teams.map(team => `
  <div class="team">
    <div class="team-header">Team #${team.teamNumber}${team.isWinner ? ' <span class="winner">(Winner)</span>' : ''}</div>
    ${((team.members as any[]) || []).map((member: any) => `
    <div class="member">${member.name} - ${member.branch} (Rank: ${member.rank})</div>
    `).join('')}
    <div class="member"><strong>Problem Statement:</strong> TBD</div>
  </div>
  `).join('')}
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
