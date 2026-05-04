import { prisma } from '@/lib/db';
import { GET } from '../route';

jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
    },
  },
}));

// Complete mock of next/server to avoid Request not defined error
jest.mock('next/server', () => ({
  NextResponse: jest.fn((body, init) => ({
    body,
    headers: new Map(Object.entries(init?.headers || {})),
    status: init?.status || 200,
    text() {
      return Promise.resolve(this.body);
    },
    get(key: string) {
      return this.headers.get(key);
    },
  })),
}));

describe('GET /api/export/participation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return CSV with correct headers and user data', async () => {
    const mockUsers = [
      {
        name: 'Alice Johnson',
        branch: 'CSE',
        rollNumber: 'CSE001',
        course: 'B.Tech',
        semesterYear: '3rd Semester',
        email: 'alice@example.com',
        contactNumber: '1234567890',
      },
      {
        name: 'Bob Smith',
        branch: 'ECE',
        rollNumber: 'ECE001',
        course: 'B.Tech',
        semesterYear: '4th Semester',
        email: 'bob@example.com',
        contactNumber: '9876543210',
      },
    ];

    (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

    const response = await GET();
    const csvText = await response.text();

    expect(prisma.user.findMany).toHaveBeenCalled();
    expect(csvText).toContain('Name,Branch,Roll Number,Course,Semester/Year,Email,Contact Number');
    expect(csvText).toContain('Alice Johnson,CSE,CSE001,B.Tech,3rd Semester,alice@example.com,1234567890');
    expect(csvText).toContain('Bob Smith,ECE,ECE001,B.Tech,4th Semester,bob@example.com,9876543210');
  });

  it('should return only headers when no users exist', async () => {
    (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

    const response = await GET();
    const csvText = await response.text();

    expect(csvText.trim()).toBe('Name,Branch,Roll Number,Course,Semester/Year,Email,Contact Number');
  });

  it('should set CSV content type header', async () => {
    (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

    const response = await GET();

    expect(response.headers.get('Content-Type')).toBe('text/csv');
    expect(response.headers.get('Content-Disposition')).toContain('attachment');
    expect(response.headers.get('Content-Disposition')).toContain('participation.csv');
  });
});
