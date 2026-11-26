import { renderHook, act, waitFor } from '@testing-library/react';
import { useSwipeDeck } from '../src/hooks/useSwipeDeck.js';
import hookSource from '../src/hooks/useSwipeDeck.js?raw';

const PROFILES = [
  { id: 'p1', order: 0, name: 'Ana', age: 24, city: 'Hue', bio: 'Bio A', interests: [], avatar: '/a.svg', avatarAlt: 'A' },
  { id: 'p2', order: 1, name: 'Binh', age: 25, city: 'Hue', bio: 'Bio B', interests: [], avatar: '/b.svg', avatarAlt: 'B' },
  { id: 'p3', order: 2, name: 'Chi', age: 26, city: 'Hue', bio: 'Bio C', interests: [], avatar: '/c.svg', avatarAlt: 'C' },
];

const json = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
const noContent = () => ({ ok: true, status: 204, json: async () => { throw new SyntaxError('No content'); } });
const deferred = () => {
  let resolve;
  const promise = new Promise((res) => { resolve = res; });
  return { promise, resolve };
};

/** Fake API; options let a test fail or hold specific requests. */
function makeServer({ initialSwipes = [], failPost = false, failDelete = false, holdPost = null } = {}) {
  let swipes = [...initialSwipes];
  let nextId = 1;

  const fetchMock = vi.fn(async (url, options = {}) => {
    const method = options.method ?? 'GET';
    if (url === '/api/profiles' && method === 'GET') return json(200, PROFILES);
    if (url === '/api/swipes' && method === 'GET') return json(200, swipes);

    if (url === '/api/swipes' && method === 'POST') {
      if (holdPost) await holdPost.promise;
      if (failPost) return json(500, { error: 'Internal server error.' });
      const body = JSON.parse(options.body);
      const created = { id: `s${nextId++}`, ...body, createdAt: '2026-11-26T05:00:00.000Z' };
      swipes = [...swipes, created];
      return json(201, created);
    }
    if (url === '/api/swipes' && method === 'DELETE') {
      swipes = [];
      return noContent();
    }
    const match = url.match(/^\/api\/swipes\/(.+)$/);
    if (match && method === 'DELETE') {
      if (failDelete) return json(500, { error: 'Internal server error.' });
      swipes = swipes.filter((x) => x.id !== match[1]);
      return noContent();
    }
    return json(404, { error: 'Not found.' });
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const mount = async () => {
  const hook = renderHook(() => useSwipeDeck());
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
};

const calls = (fetchMock, method, url) =>
  fetchMock.mock.calls.filter(([u, o = {}]) => (o.method ?? 'GET') === method && (!url || u === url));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useSwipeDeck', () => {
  test('2. loads profiles + history with abort signals; restored history skips swiped profiles', async () => {
    const fetchMock = makeServer({ initialSwipes: [{ id: 's0', profileId: 'p1', direction: 'left', createdAt: '2026-11-26T04:00:00.000Z' }] });
    const { result } = await mount();

    expect(calls(fetchMock, 'GET', '/api/profiles')[0][1].signal).toBeInstanceOf(AbortSignal);
    expect(calls(fetchMock, 'GET', '/api/swipes')[0][1].signal).toBeInstanceOf(AbortSignal);
    expect(result.current.profiles).toHaveLength(3);
    expect(result.current.history).toHaveLength(1);
    expect(result.current.currentProfile.id).toBe('p2');
    expect(result.current.score).toBe(-5);
    expect(result.current.remainingCount).toBe(2);
  });

  test('3. swipe is optimistic, then stores the server id', async () => {
    const hold = deferred();
    const fetchMock = makeServer({ holdPost: hold });
    const { result } = await mount();

    let pendingSwipe;
    act(() => {
      pendingSwipe = result.current.swipe('right');
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0]).toMatchObject({ profileId: 'p1', direction: 'right', pending: true });
    expect(result.current.currentProfile.id).toBe('p2');
    expect(result.current.score).toBe(10);

    await act(async () => {
      hold.resolve();
      await pendingSwipe;
    });

    expect(result.current.history[0]).toMatchObject({ id: 's1', pending: false });
    expect(JSON.parse(calls(fetchMock, 'POST', '/api/swipes')[0][1].body)).toEqual({ profileId: 'p1', direction: 'right' });
    expect(result.current.announcement).toBe('Liked Ana. Score 10.');
  });

  test('4. failed POST rolls back and announces the error', async () => {
    makeServer({ failPost: true });
    const { result } = await mount();

    await act(async () => {
      await result.current.swipe('up');
    });

    expect(result.current.history).toEqual([]);
    expect(result.current.currentProfile.id).toBe('p1');
    expect(result.current.score).toBe(0);
    expect(result.current.announcement).toBe('Could not save your swipe. Please try again.');
  });

  test('5a. undo pops the LAST swipe only (LIFO) and deletes it on the server', async () => {
    const fetchMock = makeServer();
    const { result } = await mount();

    await act(async () => { await result.current.swipe('right'); }); // p1 → s1
    await act(async () => { await result.current.swipe('up'); });    // p2 → s2
    await act(async () => { await result.current.undo(); });

    expect(result.current.history.map((s) => s.profileId)).toEqual(['p1']);
    expect(result.current.currentProfile.id).toBe('p2');
    expect(result.current.score).toBe(10);
    expect(calls(fetchMock, 'DELETE', '/api/swipes/s2')).toHaveLength(1);
    expect(result.current.announcement).toBe('Undid swipe on Binh. Score 10.');
  });

  test('5b. failed DELETE restores the swipe', async () => {
    makeServer({ failDelete: true });
    const { result } = await mount();

    await act(async () => { await result.current.swipe('left'); });
    await act(async () => { await result.current.undo(); });

    expect(result.current.history.map((s) => s.profileId)).toEqual(['p1']);
    expect(result.current.score).toBe(-5);
    expect(result.current.announcement).toMatch(/could not undo/i);
  });

  test('6. canUndo is false while the last swipe is pending', async () => {
    const hold = deferred();
    makeServer({ holdPost: hold });
    const { result } = await mount();
    expect(result.current.canUndo).toBe(false);

    let pendingSwipe;
    act(() => { pendingSwipe = result.current.swipe('right'); });
    expect(result.current.canUndo).toBe(false);

    await act(async () => { hold.resolve(); await pendingSwipe; });
    expect(result.current.canUndo).toBe(true);
  });

  test('7. finished state is derived; reset clears the deck', async () => {
    const fetchMock = makeServer();
    const { result } = await mount();

    for (const direction of ['right', 'left', 'up']) {
      await act(async () => { await result.current.swipe(direction); });
    }

    expect(result.current.isFinished).toBe(true);
    expect(result.current.currentProfile).toBeUndefined();
    expect(result.current.remainingCount).toBe(0);
    expect(result.current.score).toBe(20);
    expect(result.current.announcement).toBe('Super liked Chi. Score 20. No more profiles.');

    await act(async () => { await result.current.reset(); });
    expect(calls(fetchMock, 'DELETE', '/api/swipes')).toHaveLength(1);
    expect(result.current.history).toEqual([]);
    expect(result.current.currentProfile.id).toBe('p1');
    expect(result.current.isFinished).toBe(false);
  });

  test('7b. unmount aborts the initial loads', () => {
    const signals = [];
    vi.stubGlobal('fetch', vi.fn((url, { signal } = {}) => {
      signals.push(signal);
      return new Promise(() => {});
    }));
    const { unmount } = renderHook(() => useSwipeDeck());
    unmount();
    expect(signals.length).toBeGreaterThanOrEqual(2);
    signals.forEach((signal) => expect(signal.aborted).toBe(true));
  });

  test('8. no index/score/finished state in the hook source', () => {
    expect(hookSource).not.toMatch(/currentIndex|setIndex|setScore|setIsFinished|setCurrentProfile/);
  });
});
