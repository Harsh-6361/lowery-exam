import { prisma } from '@/lib/db';
import { GET } from '../route';

jest.mock('@/lib/db', () => ({
  prisma: {
    team: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data) => ({
      json: () => Promise.resolve(data),
    })),
  },
}));

describe('GET /api/teams', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all teams ordered by teamNumber', async () => {
    const mockTeams = [
      {
        id: 1,
        teamNumber: 1,
        members: [
          { name: 'Alice', branch: 'CSE', rank: 1 },
          { name: 'Bob', branch: 'ECE', rank: 2 },
        ],
        isWinner: false,
        createdAt: new Date(),
      },
      {
        id: 2,
        teamNumber: 2,
        members: [
          { name: 'Charlie', branch: 'CSE', rank: 3 },
          { name: 'David', branch: 'ECE', rank: 4 },
        ],
        isWinner: false,
        createdAt: new Date(),
      },
    ];

    (prisma.team.findMany as jest.Mock).mockResolvedValue(mockTeams);

    const response = await GET();
    const data = await response.json();

    expect(prisma.team.findMany).toHaveBeenCalledWith({
      orderBy: { teamNumber: 'asc' },
    });
    expect(data).toEqual(mockTeams);
  });

  it('should return empty array when no teams exist', async () => {
    (prisma.team.findMany as jest.Mock).mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual([]);
  });
});
