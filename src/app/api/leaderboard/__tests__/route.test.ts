import { prisma } from '@/lib/db';
import { GET } from '../route';

jest.mock('@/lib/db', () => ({
  prisma: {
    examAttempt: {
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

describe('GET /api/leaderboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return leaderboard with ranked users ordered by score descending', async () => {
    const mockAttempts = [
      {
        score: 90,
        user: { name: 'Alice', branch: 'CSE', rollNumber: 'CSE001' },
      },
      {
        score: 85,
        user: { name: 'Bob', branch: 'ECE', rollNumber: 'ECE002' },
      },
      {
        score: 70,
        user: { name: 'Charlie', branch: 'CSE', rollNumber: 'CSE003' },
      },
    ];
    (prisma.examAttempt.findMany as jest.Mock).mockResolvedValue(mockAttempts);

    const response = await GET();
    const data = await response.json();

    expect(prisma.examAttempt.findMany).toHaveBeenCalledWith({
      include: { user: true },
      orderBy: { score: 'desc' },
    });
    expect(data).toEqual([
      { rank: 1, name: 'Alice', branch: 'CSE', rollNumber: 'CSE001', score: 90 },
      { rank: 2, name: 'Bob', branch: 'ECE', rollNumber: 'ECE002', score: 85 },
      { rank: 3, name: 'Charlie', branch: 'CSE', rollNumber: 'CSE003', score: 70 },
    ]);
  });

  it('should return empty array when no attempts exist', async () => {
    (prisma.examAttempt.findMany as jest.Mock).mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual([]);
  });
});
