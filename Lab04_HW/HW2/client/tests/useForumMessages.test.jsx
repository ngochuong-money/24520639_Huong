import { renderHook, act, waitFor } from '@testing-library/react';
import { useForumMessages } from '../src/hooks/useForumMessages.js';
import hookSource from '../src/hooks/useForumMessages.js?raw';

const msg = (forum, n) => ({ id: `${forum}-${n}`, forum, author: 'Himass', text: `Message ${n}`, createdAt: '2026-11-26T00:00:00.000Z' });
const jsonResponse = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
const deferred = () => {
  let resolve;
  const promise = new Promise((res) => { resolve = res; });
  return { promise, resolve };
};

const mount = (forum) =>
  renderHook(({ forum: f }) => useForumMessages(f), { initialProps: { forum } });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useForumMessages', () => {
  test('1. loads messages for the forum with an abort signal', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(200, [msg('nasa', 1)]));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = mount('nasa');
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([msg('nasa', 1)]);
    expect(result.current.error).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith('/api/messages/nasa', expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  test('2. switching forum aborts the in-flight request', async () => {
    const calls = [];
    vi.stubGlobal('fetch', vi.fn((url, { signal }) => {
      const d = deferred();
      calls.push({ url, signal, d });
      return d.promise;
    }));

    const { rerender } = mount('nasa');
    rerender({ forum: 'notNasa' });

    expect(calls[0].signal.aborted).toBe(true);
    expect(calls[1].url).toBe('/api/messages/notNasa');
  });

  test('3. a late response from the old forum never overwrites the new one', async () => {
    const calls = [];
    vi.stubGlobal('fetch', vi.fn((url, { signal }) => {
      const d = deferred();
      calls.push({ url, signal, d });
      return d.promise;
    }));

    const { result, rerender } = mount('nasa');
    rerender({ forum: 'notNasa' });

    await act(async () => calls[1].d.resolve(jsonResponse(200, [msg('notNasa', 1)])));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => calls[0].d.resolve(jsonResponse(200, [msg('nasa', 1)])));
    expect(result.current.data).toEqual([msg('notNasa', 1)]);
  });

  test('4. AbortError is ignored (no error state, nothing logged)', async () => {
    const consoleSpy = vi.spyOn(console, 'error');
    vi.stubGlobal('fetch', vi.fn((url, { signal }) => {
      if (url.endsWith('/nasa')) {
        return new Promise((_, reject) => {
          signal.addEventListener('abort', () => reject(new DOMException('The operation was aborted.', 'AbortError')));
        });
      }
      return Promise.resolve(jsonResponse(200, []));
    }));

    const { result, rerender } = mount('nasa');
    rerender({ forum: 'esports-tribunal' });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test('5. HTTP error → error message and empty data', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(500, { error: 'Internal server error.' })));
    const { result } = mount('nasa');
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Could not load messages.');
    expect(result.current.data).toEqual([]);
  });

  test('6. postMessage posts JSON, then refetches', async () => {
    let store = [msg('nasa', 1)];
    const fetchMock = vi.fn(async (url, options = {}) => {
      if (options.method === 'POST') {
        const created = { ...msg('nasa', 2), ...JSON.parse(options.body) };
        store = [...store, created];
        return jsonResponse(201, created);
      }
      return jsonResponse(200, store);
    });
    vi.stubGlobal('fetch', fetchMock);

    const { result } = mount('nasa');
    await waitFor(() => expect(result.current.loading).toBe(false));

    let outcome;
    await act(async () => {
      outcome = await result.current.postMessage({ author: 'TanVuu', text: 'Hello' });
    });

    expect(outcome).toEqual({ ok: true });
    const postCall = fetchMock.mock.calls.find(([, o]) => o?.method === 'POST');
    expect(postCall[0]).toBe('/api/messages/nasa');
    expect(JSON.parse(postCall[1].body)).toEqual({ author: 'TanVuu', text: 'Hello' });
    await waitFor(() => expect(result.current.data).toHaveLength(2));
  });

  test('7. postMessage failure returns server error/fields and does not refetch', async () => {
    const fetchMock = vi.fn(async (url, options = {}) =>
      options.method === 'POST'
        ? jsonResponse(400, { error: 'Validation failed.', fields: { text: 'Message is required.' } })
        : jsonResponse(200, []),
    );
    vi.stubGlobal('fetch', fetchMock);

    const { result } = mount('nasa');
    await waitFor(() => expect(result.current.loading).toBe(false));

    let outcome;
    await act(async () => {
      outcome = await result.current.postMessage({ author: 'TanVuu', text: '' });
    });

    expect(outcome).toEqual({ ok: false, message: 'Validation failed.', fields: { text: 'Message is required.' } });
    expect(fetchMock.mock.calls.filter(([, o]) => !o?.method)).toHaveLength(1);
  });

  test('8. unmount aborts the in-flight request', () => {
    let capturedSignal;
    vi.stubGlobal('fetch', vi.fn((url, { signal }) => {
      capturedSignal = signal;
      return new Promise(() => {});
    }));
    const { unmount } = mount('nasa');
    unmount();
    expect(capturedSignal.aborted).toBe(true);
  });

  test('9. no didCancel flags, no setLoading in effect body', () => {
    expect(hookSource).not.toMatch(/didCancel/);
    expect(hookSource).not.toMatch(/setLoading/);
  });
});
