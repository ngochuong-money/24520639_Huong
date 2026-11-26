import { render, screen } from '@testing-library/react';

test('client test environment works', () => {
  render(<h1>Hen Ho Nhung Khong Yeu</h1>);
  expect(screen.getByRole('heading', { name: 'Hen Ho Nhung Khong Yeu' })).toBeInTheDocument();
});
