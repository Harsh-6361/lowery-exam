import { prisma } from '@/lib/db';
import { GET } from '../route';

jest.mock('@/lib/db', () => ({
  prisma: {
    team: {
      findMany: jest.fn(),
    },
  },
}));

// Complete mock of next/server to avoid Request not defined error
jest.mock('next/server', () => ({
  NextResponse: jest.fn((body, init) => ({
    body,
    headers: new Map(Object.entries(init?.headers || {})),
    status: init?.status || 200,
    text() {
      return Promise.resolve(this.body);
    },
    get(key: string) {
      return this.headers.get(key);
    },
  })),
}));

describe('GET /api/export/teams-print', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return HTML with correct structure and team data', async () => {
    const mockTeams = [
      {
        teamNumber: 1,
        members: [
          { name: 'Alice', branch: 'CSE', rank: 1 },
          { name: 'Bob', branch: 'ECE', rank: 2 },
        ],
        isWinner: true,
      },
      {
        teamNumber: 2,
        members: [
          { name: 'Charlie', branch: 'CSE', rank: 3 },
        ],
        isWinner: false,
      },
    ];

    (prisma.team.findMany as jest.Mock).mockResolvedValue(mockTeams);

    const response = await GET();
    const htmlText = await response.text();

    expect(prisma.team.findMany).toHaveBeenCalledWith({
      orderBy: { teamNumber: 'asc' },
    });

    // Check HTML structure
    expect(htmlText).toContain('<!DOCTYPE html>');
    expect(htmlText).toContain('<html>');
    expect(htmlText).toContain('<title>Teams List for Judges</title>');

    // Check team data is present
    expect(htmlText).toContain('Team #1');
    expect(htmlText).toContain('Team #2');
    expect(htmlText).toContain('Alice');
    expect(htmlText).toContain('Bob');
    expect(htmlText).toContain('Charlie');
    expect(htmlText).toContain('CSE');
    expect(htmlText).toContain('ECE');

    // Check problem statement placeholder
    expect(htmlText).toContain('TBD');

    // Check winner status
    expect(htmlText).toContain('Winner');
  });

  it('should include print-friendly styling with page-break-inside: avoid', async () => {
    const mockTeams = [
      {
        teamNumber: 1,
        members: [{ name: 'Alice', branch: 'CSE', rank: 1 }],
        isWinner: false,
      },
    ];

    (prisma.team.findMany as jest.Mock).mockResolvedValue(mockTeams);

    const response = await GET();
    const htmlText = await response.text();

    expect(htmlText).toContain('page-break-inside: avoid');
  });

  it('should set HTML content type header', async () => {
    (prisma.team.findMany as jest.Mock).mockResolvedValue([]);

    const response = await GET();

    expect(response.headers.get('Content-Type')).toBe('text/html');
  });

  it('should return HTML even when no teams exist', async () => {
    (prisma.team.findMany as jest.Mock).mockResolvedValue([]);

    const response = await GET();
    const htmlText = await response.text();

    expect(htmlText).toContain('<!DOCTYPE html>');
    expect(htmlText).toContain('No teams found');
  });
});
