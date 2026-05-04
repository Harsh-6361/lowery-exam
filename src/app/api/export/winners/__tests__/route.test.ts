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

describe('GET /api/export/winners', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return CSV with correct headers and winner team data', async () => {
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
    const csvText = await response.text();

    expect(prisma.team.findMany).toHaveBeenCalledWith({
      orderBy: { teamNumber: 'asc' },
    });
    expect(csvText).toContain('Team Number,Member Names,Branch,Rank,Problem Statement Selected,Winner Status');
    expect(csvText).toContain('1,"Alice, Bob",CSE/ECE,1/2,,Yes');
    expect(csvText).toContain('2,"Charlie",CSE,3,,No');
  });

  it('should return only headers when no teams exist', async () => {
    (prisma.team.findMany as jest.Mock).mockResolvedValue([]);

    const response = await GET();
    const csvText = await response.text();

    expect(csvText.trim()).toBe('Team Number,Member Names,Branch,Rank,Problem Statement Selected,Winner Status');
  });

  it('should set CSV content type header', async () => {
    (prisma.team.findMany as jest.Mock).mockResolvedValue([]);

    const response = await GET();

    expect(response.headers.get('Content-Type')).toBe('text/csv');
    expect(response.headers.get('Content-Disposition')).toContain('attachment');
    expect(response.headers.get('Content-Disposition')).toContain('winners.csv');
  });
});
