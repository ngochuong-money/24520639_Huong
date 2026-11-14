import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { useForumMessages } from './useForumMessages';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useForumMessages', () => {
  it('returns fetched messages', async () => {
    const messages = [{ id: '1', channelId: 'nasa', author: 'Huong', text: 'Hello' }];
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => messages });
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useForumMessages('nasa'));

    await waitFor(() => expect(result.current.msgs).toEqual(messages));
    expect(result.current.error).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith('/api/channels/nasa/messages', {
      signal: expect.any(AbortSignal),
    });
  });

  it('aborts the previous request when channelId changes', () => {
    const fetchMock = vi.fn().mockImplementation((_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    }));
    vi.stubGlobal('fetch', fetchMock);

    const { rerender } = renderHook(({ channelId }) => useForumMessages(channelId), {
      initialProps: { channelId: 'nasa' },
    });
    const firstSignal = fetchMock.mock.calls[0][1].signal;

    rerender({ channelId: 'esports-tribunal' });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(firstSignal.aborted).toBe(true);
    expect(fetchMock.mock.calls[1][0]).toBe('/api/channels/esports-tribunal/messages');
    expect(fetchMock.mock.calls[1][1].signal.aborted).toBe(false);
  });

  it('stores an HTTP error instead of leaving a rejected promise unhandled', async () => {
    const json = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json }));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useForumMessages('nasa'));

    await waitFor(() => expect(result.current.error).toBe('HTTP 500'));
    expect(result.current.msgs).toEqual([]);
    expect(json).not.toHaveBeenCalled();
  });

  it('ignores AbortError without logging or changing error state', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('x', 'AbortError')));
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useForumMessages('nasa'));
    await act(async () => { await Promise.resolve(); });

    expect(result.current.error).toBeNull();
    expect(result.current.msgs).toEqual([]);
    expect(log).not.toHaveBeenCalled();
  });

  it('logs a real fetch error and stores its message', async () => {
    const error = new Error('boom');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useForumMessages('nasa'));

    await waitFor(() => expect(result.current.error).toBe('boom'));
    expect(log).toHaveBeenCalledExactlyOnceWith(error);
    expect(result.current.msgs).toEqual([]);
  });
});
