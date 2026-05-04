import { prisma } from '@/lib/db';
import { GET } from '../route';

jest.mock('@/lib/db', () => ({
  prisma: {
    examAttempt: {
      findUnique: jest.fn(),
    },
    question: {
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

describe('GET /api/exam/attempt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return exam attempt for given userId', async () => {
    (prisma.examAttempt.findUnique as jest.Mock).mockResolvedValue({ score: 8 });
    (prisma.question.count as jest.Mock).mockResolvedValue(10);

    const request = {
      url: 'http://localhost/api/exam/attempt?userId=1',
    } as any;

    const response = await GET(request);
    const data = await response.json();

    expect(prisma.examAttempt.findUnique).toHaveBeenCalledWith({
      where: { userId: 1 },
    });
    expect(data).toEqual({ score: 8, total: 10 });
  });

  it('should return null when no attempt exists', async () => {
    (prisma.examAttempt.findUnique as jest.Mock).mockResolvedValue(null);

    const request = {
      url: 'http://localhost/api/exam/attempt?userId=999',
    } as any;

    const response = await GET(request);
    const data = await response.json();

    expect(data).toBeNull();
  });
});
