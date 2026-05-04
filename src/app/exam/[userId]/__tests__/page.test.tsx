import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExamPage from '../page';

// Mock the ExamInterface component
jest.mock('@/components/ExamInterface', () => {
  return function MockExamInterface({ userId }: { userId: number }) {
    return <div data-testid="exam-interface">Exam Interface for user {userId}</div>;
  };
});

describe('Exam Page', () => {
  it('should render ExamInterface with correct userId', () => {
    render(<ExamPage params={{ userId: '1' }} />);

    expect(screen.getByTestId('exam-interface')).toBeInTheDocument();
    expect(screen.getByText('Exam Interface for user 1')).toBeInTheDocument();
  });

  it('should render ExamInterface with different userId', () => {
    render(<ExamPage params={{ userId: '42' }} />);

    expect(screen.getByText('Exam Interface for user 42')).toBeInTheDocument();
  });
});
