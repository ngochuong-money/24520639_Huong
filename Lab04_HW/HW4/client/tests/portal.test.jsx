import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import AppRoutes from '../src/routes/AppRoutes.jsx';
import DisproportionalityMatrix from '../src/components/DisproportionalityMatrix.jsx';
import { findPlayer } from '@shared/players.js';

const json = (body) => ({ ok: true, status: 200, json: async () => body });

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    if (url === '/api/time') return json({ now: Date.now() });
    return json([]); // /api/profiles, /api/swipes
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );

const mainNav = () => screen.getByRole('navigation', { name: 'Main' });

describe('Appeal portal routing', () => {
  test('18a. "/" redirects to /swipe inside the layout', async () => {
    renderAt('/');
    expect(await screen.findByRole('heading', { level: 1, name: 'Discover' })).toBeInTheDocument();
    expect(within(mainNav()).getByRole('link', { name: 'Swipe' })).toHaveAttribute('aria-current', 'page');
  });

  test('18b. /dossier/himass renders the case file with an active NavLink', async () => {
    renderAt('/dossier/himass');
    expect(await screen.findByRole('heading', { level: 1, name: 'Himass' })).toBeInTheDocument();
    expect(within(mainNav()).getByRole('link', { name: 'Himass' })).toHaveAttribute('aria-current', 'page');
    expect(within(mainNav()).getByRole('link', { name: 'TanVuu' })).not.toHaveAttribute('aria-current');
    expect(screen.getByText('Saigon Phantoms')).toBeInTheDocument();
  });

  test('18c. /dossier/tanvuu shows its own verdict', async () => {
    renderAt('/dossier/tanvuu');
    await screen.findByRole('heading', { level: 1, name: 'TanVuu' });
    expect(screen.getByText(/Verdict: Disproportionate\./)).toBeInTheDocument();
  });

  test('18d. unknown playerID → 404 while the layout nav persists', async () => {
    renderAt('/dossier/ghost');
    expect(await screen.findByRole('heading', { name: /404/ })).toBeInTheDocument();
    expect(mainNav()).toBeInTheDocument();
  });
});

describe('DisproportionalityMatrix', () => {
  test('19. accessible table: caption, scoped headers, text markers, verdict as text', () => {
    render(<DisproportionalityMatrix dossier={findPlayer('himass')} />);
    const table = screen.getByRole('table', { name: 'Disproportionality matrix for Himass' });

    const colHeaders = within(table).getAllByRole('columnheader');
    expect(colHeaders.filter((th) => th.getAttribute('scope') === 'col')).toHaveLength(5);
    const rowHeaders = within(table).getAllByRole('rowheader');
    expect(rowHeaders).toHaveLength(5);
    rowHeaders.forEach((th) => expect(th).toHaveAttribute('scope', 'row'));
    expect(rowHeaders[0]).toHaveTextContent('Sanction 5');

    expect(within(table).getByText('Case')).toBeInTheDocument();
    expect(within(table).getAllByText(/P×\d/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Verdict: Proportionate\./)).toBeInTheDocument();
  });
});
