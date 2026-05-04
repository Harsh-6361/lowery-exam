import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResultsPage from '../page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

global.fetch = jest.fn();

describe('Results Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display user score from API', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({ score: 8, total: 10 }),
    });

    render(<ResultsPage params={{ userId: '1' }} />);

    expect(global.fetch).toHaveBeenCalledWith('/api/exam/attempt?userId=1');
    expect(await screen.findByText('Your Score')).toBeInTheDocument();
    expect(screen.getByText('8 / 10')).toBeInTheDocument();
  });

  it('should display percentage score', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({ score: 8, total: 10 }),
    });

    render(<ResultsPage params={{ userId: '1' }} />);

    expect(await screen.findByText('80%')).toBeInTheDocument();
  });

  it('should show link to leaderboard', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({ score: 8, total: 10 }),
    });

    render(<ResultsPage params={{ userId: '1' }} />);

    const link = await screen.findByRole('link', { name: /leaderboard/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/leaderboard');
  });
});
