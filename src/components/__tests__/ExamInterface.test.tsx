import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExamInterface from '../ExamInterface';

// Mock fetch
global.fetch = jest.fn();

const mockQuestions = [
  { id: 1, questionText: 'What is 2+2?', options: ['3', '4', '5'], correctOptionIndex: 1 },
  { id: 2, questionText: 'What is 3+3?', options: ['5', '6', '7'], correctOptionIndex: 1 },
];

describe('ExamInterface', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('should display questions and options', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue(mockQuestions),
    });

    render(<ExamInterface userId={1} />);

    await waitFor(() => {
      expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
    });
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should allow selecting an answer', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue(mockQuestions),
    });

    render(<ExamInterface userId={1} />);

    await waitFor(() => {
      expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('4'));
    expect(screen.getByLabelText('4')).toBeChecked();
  });

  it('should submit answers and show score', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockQuestions),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ score: 2, total: 2 }),
      });

    render(<ExamInterface userId={1} />);

    await waitFor(() => {
      expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('4'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByLabelText('6'));
    fireEvent.click(screen.getByText('Submit Exam'));

    await waitFor(() => {
      expect(screen.getByText('Score: 2/2')).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith('/api/exam/submit', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ userId: '1', answers: { 1: 1, 2: 1 } }),
    }));
  });

  it('should navigate between questions', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue(mockQuestions),
    });

    render(<ExamInterface userId={1} />);

    await waitFor(() => {
      expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('What is 3+3?')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Previous'));
    expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
  });
});
