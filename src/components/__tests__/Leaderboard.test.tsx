import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Leaderboard from '../Leaderboard';

global.fetch = jest.fn();

describe('Leaderboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render leaderboard with user data', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue([
        { rank: 1, name: 'Alice', branch: 'CSE', rollNumber: 'CSE001', score: 90 },
        { rank: 2, name: 'Bob', branch: 'ECE', rollNumber: 'ECE002', score: 85 },
      ]),
    });

    render(<Leaderboard />);

    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('90')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<Leaderboard />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show empty state when no data', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue([]),
    });

    render(<Leaderboard />);

    expect(await screen.findByText('No results yet.')).toBeInTheDocument();
  });
});
