import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExamControls from '../ExamControls';

global.fetch = jest.fn();

describe('ExamControls', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('should display current exam status when loaded', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ isStarted: false, isEnded: false }),
    });

    render(<ExamControls />);

    await waitFor(() => {
      expect(screen.getByText('Exam Not Started')).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith('/api/exam/state');
  });

  it('should show "Exam Started" when exam is started', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ isStarted: true, isEnded: false }),
    });

    render(<ExamControls />);

    await waitFor(() => {
      expect(screen.getByText('Exam Started')).toBeInTheDocument();
    });
  });

  it('should disable start button when exam is already started', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ isStarted: true, isEnded: false }),
    });

    render(<ExamControls />);

    await waitFor(() => {
      expect(screen.getByText('Start Exam')).toBeDisabled();
    });
  });

  it('should call start API when start button is clicked', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce({ isStarted: false, isEnded: false }),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce({ isStarted: true, isEnded: false }),
      });

    render(<ExamControls />);

    await waitFor(() => {
      expect(screen.getByText('Start Exam')).not.toBeDisabled();
    });

    fireEvent.click(screen.getByText('Start Exam'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/exam/start', { method: 'POST' });
    });
  });

  it('should call end API when end button is clicked', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce({ isStarted: true, isEnded: false }),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce({ isStarted: true, isEnded: true }),
      });

    render(<ExamControls />);

    await waitFor(() => {
      expect(screen.getByText('End Exam')).not.toBeDisabled();
    });

    fireEvent.click(screen.getByText('End Exam'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/exam/end', { method: 'POST' });
    });
  });
});
