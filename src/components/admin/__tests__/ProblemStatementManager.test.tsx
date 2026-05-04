import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProblemStatementManager from '../ProblemStatementManager';

// Mock fetch
global.fetch = jest.fn();

describe('ProblemStatementManager', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('should display existing problem statements on load', async () => {
    const mockProblems = [
      { id: 1, title: 'Problem 1', description: 'Desc 1', createdAt: '2024-01-01' },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockProblems),
    });

    render(<ProblemStatementManager />);

    await waitFor(() => {
      expect(screen.getByText('Problem 1')).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith('/api/problem-statements');
  });

  it('should add a new problem statement', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce([]),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce({ id: 1, title: 'New Problem', description: 'New Desc' }),
      });

    render(<ProblemStatementManager />);

    fireEvent.change(screen.getByPlaceholderText('Problem title'), { target: { value: 'New Problem' } });
    fireEvent.change(screen.getByPlaceholderText('Problem description'), { target: { value: 'New Desc' } });
    fireEvent.click(screen.getByText('Add Problem'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/problem-statements', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'New Problem', description: 'New Desc' }),
      }));
    });
  });

  it('should delete a problem statement', async () => {
    const mockProblems = [
      { id: 1, title: 'Problem 1', description: 'Desc 1', createdAt: '2024-01-01' },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockProblems),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce({ success: true }),
      });

    render(<ProblemStatementManager />);

    await waitFor(() => {
      expect(screen.getByText('Problem 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/problem-statements?id=1', expect.objectContaining({
        method: 'DELETE',
      }));
    });
  });
});
