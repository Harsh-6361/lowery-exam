import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuestionManager from '../QuestionManager';

// Mock fetch
global.fetch = jest.fn();

describe('QuestionManager', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('should display existing questions on load', async () => {
    const mockQuestions = [
      { id: 1, questionText: 'Test 1', options: ['A', 'B'], correctOptionIndex: 0, createdAt: '2024-01-01' },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockQuestions),
    });

    render(<QuestionManager />);

    await waitFor(() => {
      expect(screen.getByText('Test 1')).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith('/api/questions');
  });

  it('should add a new question', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce([]),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce({ id: 1, questionText: 'New Q', options: ['A', 'B'], correctOptionIndex: 0 }),
      });

    render(<QuestionManager />);

    fireEvent.change(screen.getByPlaceholderText('Question text'), { target: { value: 'New Q' } });
    fireEvent.change(screen.getByPlaceholderText('Options (comma-separated)'), { target: { value: 'A,B' } });
    fireEvent.change(screen.getByPlaceholderText('Correct option index'), { target: { value: '0' } });
    fireEvent.click(screen.getByText('Add Question'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/questions', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ questionText: 'New Q', options: ['A', 'B'], correctOptionIndex: 0 }),
      }));
    });
  });

  it('should delete a question', async () => {
    const mockQuestions = [
      { id: 1, questionText: 'Test 1', options: ['A', 'B'], correctOptionIndex: 0, createdAt: '2024-01-01' },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockQuestions),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce({ success: true }),
      });

    render(<QuestionManager />);

    await waitFor(() => {
      expect(screen.getByText('Test 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/questions?id=1', expect.objectContaining({
        method: 'DELETE',
      }));
    });
  });
});
