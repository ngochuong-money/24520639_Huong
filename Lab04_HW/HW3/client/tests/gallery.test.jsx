import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, useNavigate } from 'react-router';
import AppRoutes from '../src/routes/AppRoutes.jsx';
import GallerySkeleton from '../src/components/GallerySkeleton.jsx';
import { photos } from '../src/data/photos.js';

const ARENA = photos.find((p) => p.id === 'arena-stage');

// Test-only helper: shows the current URL and lets tests press Back/Forward
function LocationProbe() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <span data-testid="location">{location.pathname + location.search}</span>
      <button type="button" onClick={() => navigate(-1)}>test-back</button>
      <button type="button" onClick={() => navigate(1)}>test-forward</button>
    </>
  );
}

const renderAt = (entries, initialIndex = entries.length - 1) => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={entries} initialIndex={initialIndex}>
      <AppRoutes />
      <LocationProbe />
    </MemoryRouter>,
  );
  return user;
};

const currentUrl = () => screen.getByTestId('location').textContent;
const getDialog = () => document.querySelector('dialog');
const thumbLink = (photo) => screen.getByRole('link', { name: new RegExp(photo.title) });

describe('HW3 — photo gallery with URL-synced <dialog>', () => {
  test('1. "/" redirects to /gallery and renders one link per photo with its alt text', async () => {
    renderAt(['/']);
    await screen.findByRole('heading', { level: 1, name: 'Photo Gallery' });
    expect(currentUrl()).toBe('/gallery');

    const grid = screen.getByRole('list');
    expect(grid.querySelectorAll('a')).toHaveLength(photos.length);
    photos.forEach((photo) => {
      expect(screen.getByAltText(photo.alt)).toBeInTheDocument();
    });
  });

  test('2. clicking a thumbnail sets ?photoId and opens the dialog', async () => {
    const user = renderAt(['/gallery']);
    await screen.findByRole('heading', { level: 1, name: 'Photo Gallery' });

    await user.click(thumbLink(ARENA));

    expect(currentUrl()).toBe('/gallery?photoId=arena-stage');
    expect(getDialog()).toHaveAttribute('open');
    expect(getDialog()).toHaveAccessibleName('Arena Stage');
  });

  test('3. deep link opens the dialog on first render', async () => {
    renderAt(['/gallery?photoId=arena-stage']);
    await screen.findByRole('heading', { level: 1, name: 'Photo Gallery' });
    expect(getDialog()).toHaveAttribute('open');
    expect(getDialog()).toHaveAccessibleName('Arena Stage');
  });

  test('4. "Close photo" removes photoId, closes the dialog and returns focus to the thumbnail', async () => {
    const user = renderAt(['/gallery?photoId=arena-stage']);
    await screen.findByRole('heading', { level: 1, name: 'Photo Gallery' });

    await user.click(screen.getByRole('button', { name: 'Close photo', hidden: true }));

    expect(currentUrl()).toBe('/gallery');
    expect(getDialog()).not.toHaveAttribute('open');
    expect(document.activeElement).toBe(document.getElementById('thumb-arena-stage'));
  });

  test('5. native close (Esc path) removes photoId', async () => {
    renderAt(['/gallery?photoId=arena-stage']);
    await screen.findByRole('heading', { level: 1, name: 'Photo Gallery' });

    act(() => getDialog().close());

    expect(currentUrl()).toBe('/gallery');
    expect(getDialog()).not.toHaveAttribute('open');
  });

  test('6. other search params survive opening and closing', async () => {
    const user = renderAt(['/gallery?album=x']);
    await screen.findByRole('heading', { level: 1, name: 'Photo Gallery' });

    await user.click(thumbLink(ARENA));
    expect(currentUrl()).toBe('/gallery?album=x&photoId=arena-stage');

    await user.click(screen.getByRole('button', { name: 'Close photo', hidden: true }));
    expect(currentUrl()).toBe('/gallery?album=x');
  });

  test('7. unknown photoId keeps the dialog closed and shows a status notice', async () => {
    renderAt(['/gallery?photoId=does-not-exist']);
    await screen.findByRole('heading', { level: 1, name: 'Photo Gallery' });

    expect(getDialog()).not.toHaveAttribute('open');
    expect(screen.getByRole('status')).toHaveTextContent('Photo not found.');
    expect(screen.getByRole('link', { name: 'Show all photos' })).toHaveAttribute('href', '/gallery');
  });

  test('8. Back closes the dialog without an extra navigation (Forward still reopens it)', async () => {
    const user = renderAt(['/gallery', '/gallery?photoId=arena-stage']);
    await screen.findByRole('heading', { level: 1, name: 'Photo Gallery' });
    expect(getDialog()).toHaveAttribute('open');

    await user.click(screen.getByRole('button', { name: 'test-back', hidden: true }));
    expect(currentUrl()).toBe('/gallery');
    expect(getDialog()).not.toHaveAttribute('open');

    // A redundant push during close would have erased the forward entry
    await user.click(screen.getByRole('button', { name: 'test-forward', hidden: true }));
    expect(currentUrl()).toBe('/gallery?photoId=arena-stage');
    expect(getDialog()).toHaveAttribute('open');
  });

  test('9. dialog is labelled by its heading; close button is type="button"', async () => {
    renderAt(['/gallery?photoId=arena-stage']);
    await screen.findByRole('heading', { level: 1, name: 'Photo Gallery' });

    const dialog = getDialog();
    const heading = dialog.querySelector('h2');
    expect(heading).toHaveTextContent('Arena Stage');
    expect(dialog).toHaveAttribute('aria-labelledby', heading.id);
    expect(screen.getByRole('button', { name: 'Close photo', hidden: true })).toHaveAttribute('type', 'button');
  });

  test('10. skeleton announces loading accessibly', () => {
    const { container } = render(<GallerySkeleton />);
    const main = container.querySelector('main');
    expect(main).toHaveAttribute('aria-busy', 'true');
    expect(main).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText(/loading gallery/i)).toBeInTheDocument();
  });

  test('11. unknown route renders the 404 page', async () => {
    renderAt(['/nope']);
    expect(await screen.findByRole('heading', { name: /404/ })).toBeInTheDocument();
  });
});
