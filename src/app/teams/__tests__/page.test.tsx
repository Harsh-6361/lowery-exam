import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeamsPage from '../page';

jest.mock('@/components/TeamsList', () => {
  return function MockTeamsList() {
    return <div>Teams List Component</div>;
  };
});

global.fetch = jest.fn();

describe('TeamsPage', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('should render teams when showTeams is true', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({ showTeams: true }),
    });

    render(<TeamsPage />);

    await waitFor(() => {
      expect(screen.getByText('Teams')).toBeInTheDocument();
    });
  });

  it('should not render teams when showTeams is false', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({ showTeams: false }),
    });

    render(<TeamsPage />);

    await waitFor(() => {
      expect(screen.queryByText('Teams')).not.toBeInTheDocument();
    });
  });
});
