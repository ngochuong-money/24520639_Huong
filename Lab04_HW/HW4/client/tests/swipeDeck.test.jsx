import { render, screen, within, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SwipeDeck from '../src/components/SwipeDeck.jsx';

const PROFILES = [
  { id: 'p1', order: 0, name: 'Ana', age: 24, city: 'Hue', bio: 'Bio A', interests: ['chess'], avatar: '/a.svg', avatarAlt: 'Avatar A' },
  { id: 'p2', order: 1, name: 'Binh', age: 25, city: 'Hue', bio: 'Bio B', interests: [], avatar: '/b.svg', avatarAlt: 'Avatar B' },
  { id: 'p3', order: 2, name: 'Chi', age: 26, city: 'Hue', bio: 'Bio C', interests: [], avatar: '/c.svg', avatarAlt: 'Avatar C' },
];
const json = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
const noContent = () => ({ ok: true, status: 204, json: async () => { throw new SyntaxError('No content'); } });

function makeServer({ profilesStatus = 200 } = {}) {
  let swipes = [];
  let nextId = 1;
  const fetchMock = vi.fn(async (url, options = {}) => {
    const method = options.method ?? 'GET';
    if (url === '/api/profiles') return json(profilesStatus, profilesStatus === 200 ? PROFILES : { error: 'x' });
    if (url === '/api/swipes' && method === 'GET') return json(200, swipes);
    if (url === '/api/swipes' && method === 'POST') {
      const created = { id: `s${nextId++}`, ...JSON.parse(options.body), createdAt: '2026-11-26T05:00:00.000Z' };
      swipes = [...swipes, created];
      return json(201, created);
    }
    if (url === '/api/swipes' && method === 'DELETE') { swipes = []; return noContent(); }
    if (method === 'DELETE') { swipes = swipes.filter((s) => `/api/swipes/${s.id}` !== url); return noContent(); }
    return json(404, { error: 'Not found.' });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const renderDeck = async () => {
  const user = userEvent.setup();
  render(<SwipeDeck />);
  const deck = await screen.findByRole('region', { name: 'Profile deck' });
  await screen.findByRole('article', { name: 'Ana, 24' });
  return { user, deck };
};

const scoreValue = () => {
  const term = screen.getByText('Score', { selector: 'dt' });
  return term.nextElementSibling.textContent;
};
const liveText = () => document.querySelector('[aria-live="polite"]').textContent;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SwipeDeck UI', () => {
  test('D1. card is an article named by its h2, avatar has alt and intrinsic size', async () => {
    makeServer();
    await renderDeck();
    const card = screen.getByRole('article', { name: 'Ana, 24' });
    expect(within(card).getByRole('heading', { level: 2 })).toHaveTextContent('Ana, 24');
    expect(within(card).getByText('Bio A')).toBeInTheDocument();
    const img = within(card).getByAltText('Avatar A');
    expect(img).toHaveAttribute('width', '600');
    expect(img).toHaveAttribute('height', '800');
  });

  test('D2. focused deck: ArrowRight likes, updates score and live region', async () => {
    const fetchMock = makeServer();
    const { user, deck } = await renderDeck();
    act(() => deck.focus());
    await user.keyboard('{ArrowRight}');

    expect(await screen.findByRole('article', { name: 'Binh, 25' })).toBeInTheDocument();
    expect(scoreValue()).toBe('10');
    expect(liveText()).toBe('Liked Ana. Score 10.');
    expect(fetchMock.mock.calls.some(([u, o]) => u === '/api/swipes' && o?.method === 'POST')).toBe(true);
  });

  test('D3. Backspace undoes the last swipe', async () => {
    makeServer();
    const { user, deck } = await renderDeck();
    act(() => deck.focus());
    await user.keyboard('{ArrowUp}');
    await screen.findByRole('article', { name: 'Binh, 25' });

    await user.keyboard('{Backspace}');
    expect(await screen.findByRole('article', { name: 'Ana, 24' })).toBeInTheDocument();
    expect(scoreValue()).toBe('0');
    expect(liveText()).toBe('Undid swipe on Ana. Score 0.');
  });

  test('D4. buttons have accessible names; Undo starts disabled; clicking Like works', async () => {
    makeServer();
    const { user } = await renderDeck();
    expect(screen.getByRole('button', { name: 'Pass on Ana' })).toHaveAttribute('type', 'button');
    expect(screen.getByRole('button', { name: 'Super like Ana' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Undo last swipe' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Like Ana' }));
    expect(await screen.findByRole('article', { name: 'Binh, 25' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo last swipe' })).toBeEnabled();
  });

  test('D5. dragging the card past the threshold swipes it', async () => {
    makeServer();
    await renderDeck();
    const card = screen.getByRole('article', { name: 'Ana, 24' });
    fireEvent.pointerDown(card, { clientX: 100, clientY: 100, pointerId: 1, button: 0, isPrimary: true });
    fireEvent.pointerMove(card, { clientX: -60, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(card, { clientX: -60, clientY: 100, pointerId: 1 });

    expect(await screen.findByRole('article', { name: 'Binh, 25' })).toBeInTheDocument();
    expect(scoreValue()).toBe('-5');
  });

  test('D6. finished state offers Start over, which clears the deck', async () => {
    makeServer();
    const { user } = await renderDeck();
    await user.click(screen.getByRole('button', { name: 'Like Ana' }));
    await user.click(await screen.findByRole('button', { name: 'Pass on Binh' }));
    await user.click(await screen.findByRole('button', { name: 'Super like Chi' }));

    expect(await screen.findByText('You have seen everyone.')).toBeInTheDocument();
    expect(scoreValue()).toBe('20');
    expect(liveText()).toBe('Super liked Chi. Score 20. No more profiles.');

    await user.click(screen.getByRole('button', { name: 'Start over' }));
    expect(await screen.findByRole('article', { name: 'Ana, 24' })).toBeInTheDocument();
    expect(scoreValue()).toBe('0');
  });

  test('D7. load error is shown as an alert', async () => {
    makeServer({ profilesStatus: 500 });
    render(<SwipeDeck />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load profiles.');
  });
});
