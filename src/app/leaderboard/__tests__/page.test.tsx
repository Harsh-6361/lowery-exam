import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LeaderboardPage from '../page';

jest.mock('@/components/Leaderboard', () => {
  return function MockLeaderboard() {
    return <div>Leaderboard Component</div>;
  };
});

global.fetch = jest.fn();

describe('LeaderboardPage', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('should render leaderboard when showLeaderboard is true', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({ showLeaderboard: true }),
    });

    render(<LeaderboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Leaderboard')).toBeInTheDocument();
    });
  });

  it('should not render leaderboard when showLeaderboard is false', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({ showLeaderboard: false }),
    });

    render(<LeaderboardPage />);

    await waitFor(() => {
      expect(screen.queryByText('Leaderboard')).not.toBeInTheDocument();
    });
  });
});
