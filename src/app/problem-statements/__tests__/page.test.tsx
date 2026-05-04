import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from '../page';

// Mock fetch
global.fetch = jest.fn();

describe('Problem Statements Page', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('should display all problem statements', async () => {
    const mockProblems = [
      { id: 1, title: 'Problem 1', description: 'Desc 1', createdAt: '2024-01-01' },
      { id: 2, title: 'Problem 2', description: 'Desc 2', createdAt: '2024-01-02' },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockProblems),
    });

    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText('Problem 1')).toBeInTheDocument();
      expect(screen.getByText('Problem 2')).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith('/api/problem-statements');
  });

  it('should have a heading', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce([]),
    });

    render(<Page />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Problem Statements/i })).toBeInTheDocument();
    });
  });
});
