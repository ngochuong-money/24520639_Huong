import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import AppRoutes from '../src/routes/AppRoutes.jsx';

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );

describe('Sprint 1 — dossier routing', () => {
  test('1. "/" redirects to /dossier and shows the index route', async () => {
    renderAt('/');
    expect(await screen.findByRole('heading', { name: /select a case/i })).toBeInTheDocument();
  });

  test('2. valid playerID renders the dossier with <dl> details', async () => {
    renderAt('/dossier/himass');
    const article = await screen.findByRole('article');
    expect(within(article).getByRole('heading', { level: 2, name: 'Himass' })).toBeInTheDocument();
    expect(article.querySelector('dl')).not.toBeNull();
    expect(within(article).getByText('Saigon Phantoms')).toBeInTheDocument();
    expect(within(article).getByText('VCS-2026-W47-M03')).toBeInTheDocument();
  });

  test('3. active NavLink has aria-current="page", others do not', async () => {
    renderAt('/dossier/himass');
    await screen.findByRole('article');
    const nav = screen.getByRole('navigation', { name: /player dossiers/i });
    expect(within(nav).getByRole('link', { name: 'Himass' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'TanVuu' })).not.toHaveAttribute('aria-current');
  });

  test('4. invalid playerID renders 404 while the sidebar persists', async () => {
    renderAt('/dossier/unknown');
    expect(await screen.findByRole('heading', { name: /404/i })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /player dossiers/i })).toBeInTheDocument();
  });

  test('5. nested appeal route renders inside the dossier', async () => {
    renderAt('/dossier/himass/appeal');
    const article = await screen.findByRole('article');
    expect(within(article).getByRole('heading', { level: 2, name: 'Himass' })).toBeInTheDocument();
    expect(await within(article).findByRole('heading', { level: 3, name: /file an appeal/i })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /player dossiers/i })).toBeInTheDocument();
  });

  test('6. unknown top-level URL renders a full-page 404 without the sidebar', async () => {
    renderAt('/random');
    expect(await screen.findByRole('heading', { name: /404/i })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: /player dossiers/i })).not.toBeInTheDocument();
  });
});
