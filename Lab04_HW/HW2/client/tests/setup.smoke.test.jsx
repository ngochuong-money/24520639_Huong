import { render, screen } from '@testing-library/react';

test('test environment works', () => {
  render(<h1>Tribunal</h1>);
  expect(screen.getByRole('heading', { name: 'Tribunal' })).toBeInTheDocument();
});
