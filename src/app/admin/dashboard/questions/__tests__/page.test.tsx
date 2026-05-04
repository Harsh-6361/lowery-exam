import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from '../page';

// Mock the QuestionManager component
jest.mock('@/components/admin/QuestionManager', () => {
  return function MockQuestionManager() {
    return <div data-testid="question-manager">QuestionManager</div>;
  };
});

describe('Questions Page', () => {
  it('should render the QuestionManager component', () => {
    render(<Page />);
    expect(screen.getByTestId('question-manager')).toBeInTheDocument();
  });

  it('should have a heading', () => {
    render(<Page />);
    expect(screen.getByRole('heading', { name: /questions/i })).toBeInTheDocument();
  });
});
