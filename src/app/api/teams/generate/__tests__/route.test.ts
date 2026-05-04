import { prisma } from '@/lib/db';
import { POST } from '../route';
import { generateTeams } from '@/lib/team-algorithm';

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
    examAttempt: {
      findMany: jest.fn(),
    },
    team: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/team-algorithm', () => ({
  generateTeams: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
    })),
  },
}));

describe('POST /api/teams/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate teams and save to database', async () => {
    const mockAttempts = [
      { user: { name: 'Alice', branch: 'CSE' }, score: 100 },
      { user: { name: 'Bob', branch: 'ECE' }, score: 90 },
      { user: { name: 'Charlie', branch: 'CSE' }, score: 80 },
      { user: { name: 'David', branch: 'ECE' }, score: 70 },
      { user: { name: 'Eve', branch: 'CSE' }, score: 60 },
      { user: { name: 'Frank', branch: 'ECE' }, score: 50 },
    ];

    const mockTeams = [
      {
        teamNumber: 1,
        members: [
          { name: 'Alice', branch: 'CSE', rank: 1 },
          { name: 'Bob', branch: 'ECE', rank: 2 },
        ],
      },
      {
        teamNumber: 2,
        members: [
          { name: 'Charlie', branch: 'CSE', rank: 3 },
          { name: 'David', branch: 'ECE', rank: 4 },
        ],
      },
      {
        teamNumber: 3,
        members: [
          { name: 'Eve', branch: 'CSE', rank: 5 },
          { name: 'Frank', branch: 'ECE', rank: 6 },
        ],
      },
    ];

    (prisma.examAttempt.findMany as jest.Mock).mockResolvedValue(mockAttempts);
    (generateTeams as jest.Mock).mockReturnValue(mockTeams);

    const request = new Request('http://localhost/api/teams/generate', {
      method: 'POST',
      body: JSON.stringify({ numberOfTeams: 3, membersPerTeam: 2 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(prisma.examAttempt.findMany).toHaveBeenCalledWith({
      include: { user: true },
      orderBy: { score: 'desc' },
    });

    expect(generateTeams).toHaveBeenCalledWith(
      expect.any(Array),
      3,
      2
    );

    expect(prisma.team.deleteMany).toHaveBeenCalled();
    expect(prisma.team.create).toHaveBeenCalledTimes(3);
    expect(data).toEqual(mockTeams);
  });

  it('should return 400 if numberOfTeams is missing', async () => {
    const request = new Request('http://localhost/api/teams/generate', {
      method: 'POST',
      body: JSON.stringify({ membersPerTeam: 3 }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 if membersPerTeam is missing', async () => {
    const request = new Request('http://localhost/api/teams/generate', {
      method: 'POST',
      body: JSON.stringify({ numberOfTeams: 9 }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
