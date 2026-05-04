import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ExportButtons from '../ExportButtons';

// Mock window.open
const mockOpen = jest.fn();
Object.defineProperty(window, 'open', {
  value: mockOpen,
  writable: true,
});

describe('ExportButtons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render two export buttons', () => {
    render(<ExportButtons />);

    expect(screen.getByRole('button', { name: /export participation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export winners/i })).toBeInTheDocument();
  });

  it('should open participation CSV endpoint in new window when clicked', async () => {
    const user = userEvent.setup();
    render(<ExportButtons />);

    const participationButton = screen.getByRole('button', { name: /export participation/i });
    await user.click(participationButton);

    expect(mockOpen).toHaveBeenCalledWith('/api/export/participation', '_blank');
  });

  it('should open winners CSV endpoint in new window when clicked', async () => {
    const user = userEvent.setup();
    render(<ExportButtons />);

    const winnersButton = screen.getByRole('button', { name: /export winners/i });
    await user.click(winnersButton);

    expect(mockOpen).toHaveBeenCalledWith('/api/export/winners', '_blank');
  });

  it('should have appropriate styling classes', () => {
    render(<ExportButtons />);

    const participationButton = screen.getByRole('button', { name: /export participation/i });
    const winnersButton = screen.getByRole('button', { name: /export winners/i });

    expect(participationButton).toHaveClass('bg-blue-600');
    expect(winnersButton).toHaveClass('bg-green-600');
  });
});
