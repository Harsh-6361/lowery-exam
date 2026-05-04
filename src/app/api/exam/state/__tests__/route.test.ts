import { prisma } from '@/lib/db';
import { GET } from '../route';

jest.mock('@/lib/db', () => ({
  prisma: {
    examState: {
      findFirst: jest.fn(),
    },
    question: {
      count: jest.fn(),
    },
    user: {
      count: jest.fn(),
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

describe('GET /api/exam/state', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return showLeaderboard and showTeams fields with exam state', async () => {
    const mockState = {
      id: 1,
      isStarted: true,
      isEnded: false,
      showLeaderboard: true,
      showTeams: false,
      updatedAt: new Date(),
    };
    (prisma.examState.findFirst as jest.Mock).mockResolvedValue(mockState);
    (prisma.question.count as jest.Mock).mockResolvedValue(10);
    (prisma.user.count as jest.Mock).mockResolvedValue(50);

    const response = await GET();
    const data = await response.json();

    expect(prisma.examState.findFirst).toHaveBeenCalled();
    expect(prisma.question.count).toHaveBeenCalled();
    expect(prisma.user.count).toHaveBeenCalled();
    expect(data).toHaveProperty('showLeaderboard', true);
    expect(data).toHaveProperty('showTeams', false);
    expect(data).toHaveProperty('isStarted', true);
    expect(data).toHaveProperty('isEnded', false);
    expect(data).toHaveProperty('questionCount', 10);
    expect(data).toHaveProperty('userCount', 50);
  });

  it('should return default false values when no exam state exists', async () => {
    (prisma.examState.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.question.count as jest.Mock).mockResolvedValue(0);
    (prisma.user.count as jest.Mock).mockResolvedValue(0);

    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty('showLeaderboard', false);
    expect(data).toHaveProperty('showTeams', false);
    expect(data).toHaveProperty('isStarted', false);
    expect(data).toHaveProperty('isEnded', false);
  });
});
