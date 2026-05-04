import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LeaderboardPage from '../page';

jest.mock('@/components/Leaderboard', () => {
  return function MockLeaderboard() {
    return <div data-testid="leaderboard">Leaderboard Component</div>;
  };
});

describe('Leaderboard Page', () => {
  it('should render the Leaderboard component', () => {
    render(<LeaderboardPage />);

    expect(screen.getByTestId('leaderboard')).toBeInTheDocument();
  });

  it('should have a heading', () => {
    render(<LeaderboardPage />);

    expect(screen.getByRole('heading', { name: /leaderboard/i })).toBeInTheDocument();
  });
});
