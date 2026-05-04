import { prisma } from '@/lib/db';
import { POST } from '../route';

// Polyfill Request for test environment
global.Request = class Request {
  private body: any;
  constructor(url: string, init?: { body?: string }) {
    this.body = init?.body ? JSON.parse(init.body) : null;
  }
  json() {
    return Promise.resolve(this.body);
  }
} as any;

jest.mock('@/lib/db', () => ({
  prisma: {
    team: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
    })),
  },
}));

describe('POST /api/teams/[id]/winner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should toggle isWinner from false to true', async () => {
    const mockTeam = {
      id: 1,
      teamNumber: 1,
      members: [{ name: 'Alice', branch: 'CSE', rank: 1 }],
      isWinner: false,
      createdAt: new Date(),
    };

    (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
    (prisma.team.update as jest.Mock).mockResolvedValue({
      ...mockTeam,
      isWinner: true,
    });

    const response = await POST(
      { url: 'http://localhost/api/teams/1/winner' } as Request,
      { params: { id: '1' } }
    );
    const data = await response.json();

    expect(prisma.team.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(prisma.team.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { isWinner: true },
    });
    expect(data.isWinner).toBe(true);
  });

  it('should toggle isWinner from true to false', async () => {
    const mockTeam = {
      id: 2,
      teamNumber: 2,
      members: [{ name: 'Bob', branch: 'ECE', rank: 2 }],
      isWinner: true,
      createdAt: new Date(),
    };

    (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
    (prisma.team.update as jest.Mock).mockResolvedValue({
      ...mockTeam,
      isWinner: false,
    });

    const response = await POST(
      { url: 'http://localhost/api/teams/2/winner' } as Request,
      { params: { id: '2' } }
    );
    const data = await response.json();

    expect(prisma.team.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { isWinner: false },
    });
    expect(data.isWinner).toBe(false);
  });

  it('should return 404 if team not found', async () => {
    (prisma.team.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await POST(
      { url: 'http://localhost/api/teams/999/winner' } as Request,
      { params: { id: '999' } }
    );

    expect(response.status).toBe(404);
    expect(prisma.team.update).not.toHaveBeenCalled();
  });
});
