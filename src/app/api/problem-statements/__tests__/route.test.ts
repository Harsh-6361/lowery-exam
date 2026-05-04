import { prisma } from '@/lib/db';
import { GET, POST, DELETE } from '../route';

jest.mock('@/lib/db', () => ({
  prisma: {
    problemStatement: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
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

describe('Problem Statements API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return all problem statements ordered by createdAt desc', async () => {
      const mockProblems = [
        { id: 1, title: 'Problem 1', description: 'Desc 1', createdAt: new Date() },
        { id: 2, title: 'Problem 2', description: 'Desc 2', createdAt: new Date() },
      ];

      (prisma.problemStatement.findMany as jest.Mock).mockResolvedValue(mockProblems);

      const response = await GET();
      const data = await response.json();

      expect(prisma.problemStatement.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(data[0].id).toEqual(mockProblems[0].id);
      expect(data[0].title).toEqual(mockProblems[0].title);
      expect(data[1].id).toEqual(mockProblems[1].id);
    });
  });

  describe('POST', () => {
    it('should create a new problem statement', async () => {
      const newProblem = {
        title: 'New Problem',
        description: 'Problem description',
      };

      const createdProblem = { id: 1, ...newProblem, createdAt: new Date() };
      (prisma.problemStatement.create as jest.Mock).mockResolvedValue(createdProblem);

      const request = {
        json: jest.fn().mockResolvedValue(newProblem),
      } as any;

      const response = await POST(request);
      const data = await response.json();

      expect(prisma.problemStatement.create).toHaveBeenCalledWith({
        data: newProblem,
      });
      expect(data.id).toEqual(createdProblem.id);
      expect(data.title).toEqual(createdProblem.title);
    });
  });

  describe('DELETE', () => {
    it('should delete a problem statement by id', async () => {
      const request = {
        url: 'http://localhost/api/problem-statements?id=1',
      } as any;

      (prisma.problemStatement.delete as jest.Mock).mockResolvedValue({});

      const response = await DELETE(request);
      const data = await response.json();

      expect(prisma.problemStatement.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(data).toEqual({ success: true });
    });

    it('should return 400 if id is not provided', async () => {
      const request = {
        url: 'http://localhost/api/problem-statements',
      } as any;

      const response = await DELETE(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toEqual({ error: 'ID required' });
    });
  });
});
