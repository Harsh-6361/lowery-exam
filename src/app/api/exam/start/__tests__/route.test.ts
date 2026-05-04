import { prisma } from '@/lib/db';
import { POST } from '../route';

jest.mock('@/lib/db', () => ({
  prisma: {
    examState: {
      findFirst: jest.fn(),
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

describe('POST /api/exam/start', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create exam state with isStarted true when no state exists', async () => {
    (prisma.examState.findFirst as jest.Mock).mockResolvedValue(null);
    const mockCreatedState = { id: 1, isStarted: true, isEnded: false };
    (prisma.examState.create as jest.Mock).mockResolvedValue(mockCreatedState);

    const response = await POST();
    const data = await response.json();

    expect(prisma.examState.findFirst).toHaveBeenCalled();
    expect(prisma.examState.create).toHaveBeenCalledWith({
      data: { id: 1, isStarted: true, isEnded: false },
    });
    expect(data.isStarted).toBe(true);
    expect(data.isEnded).toBe(false);
  });

  it('should update exam state with isStarted true when state exists', async () => {
    const existingState = { id: 1, isStarted: false, isEnded: false };
    (prisma.examState.findFirst as jest.Mock).mockResolvedValue(existingState);
    const mockUpdatedState = { id: 1, isStarted: true, isEnded: false };
    (prisma.examState.update as jest.Mock).mockResolvedValue(mockUpdatedState);

    const response = await POST();
    const data = await response.json();

    expect(prisma.examState.findFirst).toHaveBeenCalled();
    expect(prisma.examState.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { isStarted: true, isEnded: false },
    });
    expect(data.isStarted).toBe(true);
    expect(data.isEnded).toBe(false);
  });
});
