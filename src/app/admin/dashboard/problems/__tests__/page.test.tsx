import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from '../page';

// Mock the ProblemStatementManager component
jest.mock('@/components/admin/ProblemStatementManager', () => {
  return function MockProblemStatementManager() {
    return <div data-testid="problem-statement-manager">ProblemStatementManager</div>;
  };
});

describe('Problems Page', () => {
  it('should render the ProblemStatementManager component', () => {
    render(<Page />);
    expect(screen.getByTestId('problem-statement-manager')).toBeInTheDocument();
  });

  it('should have a heading', () => {
    render(<Page />);
    expect(screen.getByRole('heading', { name: /Problem Statements/i })).toBeInTheDocument();
  });
});
