import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TeamGenerator from '../TeamGenerator';

// Mock fetch
global.fetch = jest.fn();

describe('TeamGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render number inputs and generate button', () => {
    render(<TeamGenerator />);

    expect(screen.getByLabelText(/number of teams/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/members per team/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate teams/i })).toBeInTheDocument();
  });

  it('should call API with correct values when form is submitted', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ teamNumber: 1, members: [] }],
    });

    render(<TeamGenerator />);

    fireEvent.change(screen.getByLabelText(/number of teams/i), {
      target: { value: '9' },
    });
    fireEvent.change(screen.getByLabelText(/members per team/i), {
      target: { value: '3' },
    });

    fireEvent.click(screen.getByRole('button', { name: /generate teams/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/teams/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numberOfTeams: 9, membersPerTeam: 3 }),
      });
    });
  });

  it('should show error message on API failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
    });

    render(<TeamGenerator />);

    fireEvent.change(screen.getByLabelText(/number of teams/i), {
      target: { value: '9' },
    });
    fireEvent.change(screen.getByLabelText(/members per team/i), {
      target: { value: '3' },
    });

    fireEvent.click(screen.getByRole('button', { name: /generate teams/i }));

    await waitFor(() => {
      expect(screen.getByText(/error generating teams/i)).toBeInTheDocument();
    });
  });
});
