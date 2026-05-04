import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import TeamsList from '../TeamsList';

global.fetch = jest.fn();

describe('TeamsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render teams with member details', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => [
        {
          teamNumber: 1,
          members: [
            { name: 'Alice', branch: 'CSE', rank: 1 },
            { name: 'Bob', branch: 'ECE', rank: 2 },
          ],
        },
        {
          teamNumber: 2,
          members: [
            { name: 'Charlie', branch: 'CSE', rank: 3 },
            { name: 'David', branch: 'ECE', rank: 4 },
          ],
        },
      ],
    });

    render(<TeamsList />);

    expect(await screen.findByText('Team 1')).toBeInTheDocument();
    expect(screen.getByText('Team 2')).toBeInTheDocument();
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
    expect(screen.getByText(/Bob/)).toBeInTheDocument();
    expect(screen.getByText(/Charlie/)).toBeInTheDocument();
    expect(screen.getByText(/David/)).toBeInTheDocument();
  });

  it('should show empty state when no teams exist', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => [],
    });

    render(<TeamsList />);

    expect(await screen.findByText(/no teams/i)).toBeInTheDocument();
  });
});
