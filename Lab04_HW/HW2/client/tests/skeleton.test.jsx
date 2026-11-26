import { render, screen } from '@testing-library/react';
import Skeleton from '../src/components/Skeleton.jsx';

test('dossier skeleton announces loading state accessibly', () => {
  const { container } = render(<Skeleton />);
  const region = container.querySelector('section');
  expect(region).toHaveAttribute('aria-busy', 'true');
  expect(region).toHaveAttribute('aria-live', 'polite');
  expect(region).toHaveClass('dossier');
  expect(screen.getByText(/loading dossier/i)).toBeInTheDocument();
});

test('appeal skeleton uses the appeal container', () => {
  const { container } = render(<Skeleton variant="appeal" />);
  expect(container.querySelector('section')).toHaveClass('appeal');
  expect(screen.getByText(/loading appeal form/i)).toBeInTheDocument();
});
