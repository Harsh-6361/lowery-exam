import { prisma } from '@/lib/db';
import { GET, POST, DELETE } from '../route';

jest.mock('@/lib/db', () => ({
  prisma: {
    question: {
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

describe('Questions API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return all questions ordered by createdAt desc', async () => {
      const mockQuestions = [
        { id: 1, questionText: 'Test 1', options: ['A', 'B'], correctOptionIndex: 0, createdAt: new Date() },
        { id: 2, questionText: 'Test 2', options: ['C', 'D'], correctOptionIndex: 1, createdAt: new Date() },
      ];

      (prisma.question.findMany as jest.Mock).mockResolvedValue(mockQuestions);

      const response = await GET();
      const data = await response.json();

      expect(prisma.question.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(data[0].id).toEqual(mockQuestions[0].id);
      expect(data[0].questionText).toEqual(mockQuestions[0].questionText);
      expect(data[1].id).toEqual(mockQuestions[1].id);
    });
  });

  describe('POST', () => {
    it('should create a new question', async () => {
      const newQuestion = {
        questionText: 'What is 2+2?',
        options: ['3', '4', '5'],
        correctOptionIndex: 1,
      };

      const createdQuestion = { id: 1, ...newQuestion, createdAt: new Date() };
      (prisma.question.create as jest.Mock).mockResolvedValue(createdQuestion);

      const request = {
        json: jest.fn().mockResolvedValue(newQuestion),
      } as any;

      const response = await POST(request);
      const data = await response.json();

      expect(prisma.question.create).toHaveBeenCalledWith({
        data: newQuestion,
      });
      expect(data.id).toEqual(createdQuestion.id);
      expect(data.questionText).toEqual(createdQuestion.questionText);
    });
  });

  describe('DELETE', () => {
    it('should delete a question by id', async () => {
      const request = {
        url: 'http://localhost/api/questions?id=1',
      } as any;

      (prisma.question.delete as jest.Mock).mockResolvedValue({});

      const response = await DELETE(request);
      const data = await response.json();

      expect(prisma.question.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(data).toEqual({ success: true });
    });

    it('should return 400 if id is not provided', async () => {
      const request = {
        url: 'http://localhost/api/questions',
      } as any;

      const response = await DELETE(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toEqual({ error: 'ID required' });
    });
  });
});
