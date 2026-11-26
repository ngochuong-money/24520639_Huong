import { render, screen } from '@testing-library/react';

test('test environment works', () => {
  render(<h1>Photo Gallery</h1>);
  expect(screen.getByRole('heading', { name: 'Photo Gallery' })).toBeInTheDocument();
});
