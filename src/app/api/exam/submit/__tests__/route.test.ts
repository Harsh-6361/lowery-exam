import { prisma } from '@/lib/db';
import { POST } from '../route';

jest.mock('@/lib/db', () => ({
  prisma: {
    question: {
      findMany: jest.fn(),
    },
    examAttempt: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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

describe('POST /api/exam/submit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate score and create exam attempt for new user', async () => {
    const mockQuestions = [
      { id: 1, correctOptionIndex: 0 },
      { id: 2, correctOptionIndex: 2 },
      { id: 3, correctOptionIndex: 1 },
    ];
    (prisma.question.findMany as jest.Mock).mockResolvedValue(mockQuestions);
    (prisma.examAttempt.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.examAttempt.create as jest.Mock).mockResolvedValue({});

    const request = {
      json: jest.fn().mockResolvedValue({
        userId: '1',
        answers: { 1: 0, 2: 2, 3: 0 },
      }),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(prisma.question.findMany).toHaveBeenCalled();
    expect(prisma.examAttempt.findUnique).toHaveBeenCalledWith({
      where: { userId: 1 },
    });
    expect(prisma.examAttempt.create).toHaveBeenCalledWith({
      data: {
        userId: 1,
        answers: { 1: 0, 2: 2, 3: 0 },
        score: 2,
      },
    });
    expect(data.score).toBe(2);
    expect(data.total).toBe(3);
  });

  it('should update existing exam attempt for returning user', async () => {
    const mockQuestions = [
      { id: 1, correctOptionIndex: 0 },
      { id: 2, correctOptionIndex: 1 },
    ];
    (prisma.question.findMany as jest.Mock).mockResolvedValue(mockQuestions);
    (prisma.examAttempt.findUnique as jest.Mock).mockResolvedValue({
      id: 5,
      userId: 1,
    });
    (prisma.examAttempt.update as jest.Mock).mockResolvedValue({});

    const request = {
      json: jest.fn().mockResolvedValue({
        userId: '1',
        answers: { 1: 0, 2: 1 },
      }),
    } as any;

    const response = await POST(request);
    const data = await response.json();

    expect(prisma.examAttempt.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: {
        answers: { 1: 0, 2: 1 },
        score: 2,
        submittedAt: expect.any(Date),
      },
    });
    expect(data.score).toBe(2);
    expect(data.total).toBe(2);
  });
});
