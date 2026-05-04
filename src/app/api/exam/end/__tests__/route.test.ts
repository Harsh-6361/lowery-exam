import { prisma } from '@/lib/db';
import { POST } from '../route';

jest.mock('@/lib/db', () => ({
  prisma: {
    examState: {
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

describe('POST /api/exam/end', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update exam state with isEnded true', async () => {
    const mockUpdatedState = { id: 1, isStarted: true, isEnded: true };
    (prisma.examState.update as jest.Mock).mockResolvedValue(mockUpdatedState);

    const response = await POST();
    const data = await response.json();

    expect(prisma.examState.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { isEnded: true },
    });
    expect(data.isEnded).toBe(true);
  });
});
