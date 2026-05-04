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

describe('POST /api/exam/visibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update showLeaderboard to true when state exists', async () => {
    const existingState = {
      id: 1,
      isStarted: true,
      isEnded: false,
      showLeaderboard: false,
      showTeams: false,
    };
    (prisma.examState.findFirst as jest.Mock).mockResolvedValue(existingState);
    const mockUpdatedState = { ...existingState, showLeaderboard: true };
    (prisma.examState.update as jest.Mock).mockResolvedValue(mockUpdatedState);

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ showLeaderboard: true }),
    };
    const response = await POST(mockRequest as any);
    const data = await response.json();

    expect(prisma.examState.findFirst).toHaveBeenCalled();
    expect(prisma.examState.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { showLeaderboard: true },
    });
    expect(data.showLeaderboard).toBe(true);
  });

  it('should update showTeams to true when state exists', async () => {
    const existingState = {
      id: 1,
      isStarted: true,
      isEnded: false,
      showLeaderboard: false,
      showTeams: false,
    };
    (prisma.examState.findFirst as jest.Mock).mockResolvedValue(existingState);
    const mockUpdatedState = { ...existingState, showTeams: true };
    (prisma.examState.update as jest.Mock).mockResolvedValue(mockUpdatedState);

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ showTeams: true }),
    };
    const response = await POST(mockRequest as any);
    const data = await response.json();

    expect(prisma.examState.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { showTeams: true },
    });
    expect(data.showTeams).toBe(true);
  });

  it('should create state if none exists when updating visibility', async () => {
    (prisma.examState.findFirst as jest.Mock).mockResolvedValue(null);
    const mockCreatedState = {
      id: 1,
      isStarted: false,
      isEnded: false,
      showLeaderboard: true,
      showTeams: false,
    };
    (prisma.examState.create as jest.Mock).mockResolvedValue(mockCreatedState);

    const mockRequest = {
      json: jest.fn().mockResolvedValue({ showLeaderboard: true }),
    };
    const response = await POST(mockRequest as any);
    const data = await response.json();

    expect(prisma.examState.create).toHaveBeenCalledWith({
      data: { id: 1, isStarted: false, isEnded: false, showLeaderboard: true, showTeams: false },
    });
    expect(data.showLeaderboard).toBe(true);
  });
});
