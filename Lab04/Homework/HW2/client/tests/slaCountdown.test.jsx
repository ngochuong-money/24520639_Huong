import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import SlaCountdown from '../src/components/SlaCountdown.jsx';
import AppRoutes from '../src/routes/AppRoutes.jsx';

const MINUTE = 60 * 1000;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SlaCountdown', () => {
  test('12. renders a machine-readable <time> duration and padded text', () => {
    const { container } = render(
      <SlaCountdown
        remainingMs={93_784_000}
        isExpired={false}
        isSynced
        parts={{ d: 1, h: 2, m: 3, s: 4 }}
      />,
    );
    const time = container.querySelector('time');
    expect(time).toHaveAttribute('dateTime', 'P1DT2H3M4S');
    expect(time).toHaveTextContent('1d 02h 03m 04s');
  });

  test('13. milestone announcement changes at the 10-minute boundary', () => {
    const props = { isExpired: false, isSynced: true };
    const { rerender } = render(
      <SlaCountdown {...props} remainingMs={11 * MINUTE} parts={{ d: 0, h: 0, m: 11, s: 0 }} />,
    );
    expect(screen.getByText('Less than 1 hour left to appeal.')).toBeInTheDocument();

    rerender(<SlaCountdown {...props} remainingMs={10 * MINUTE} parts={{ d: 0, h: 0, m: 10, s: 0 }} />);
    expect(screen.getByText('Less than 10 minutes left to appeal.')).toBeInTheDocument();
    expect(screen.queryByText('Less than 1 hour left to appeal.')).not.toBeInTheDocument();
  });

  test('14. expired dossier disables the appeal submit and shows the closed notice', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ now: Date.now() }) }),
    );
    render(
      <MemoryRouter initialEntries={['/dossier/tanvuu/appeal']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    const submit = await screen.findByRole('button', { name: 'Submit appeal' });
    expect(submit).toBeDisabled();
    expect(submit.closest('form')).toHaveTextContent('The appeal window has closed.');
  });
});
