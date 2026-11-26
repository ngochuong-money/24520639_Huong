import { renderHook, act } from '@testing-library/react';
import { useAppealSlaTimer } from '../src/hooks/useAppealSlaTimer.js';
import hookSource from '../src/hooks/useAppealSlaTimer.js?raw';

const T0 = Date.UTC(2026, 10, 25, 5, 0, 0); // 2026-11-25 12:00:00 +07:00, on a whole second
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const iso = (ms) => new Date(ms).toISOString();

const serverClock = (skewMs = 0) =>
  vi.fn().mockImplementation(async () => ({
    ok: true,
    json: async () => ({ now: Date.now() + skewMs }),
  }));

const flush = () =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });

const advance = (ms) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

const mount = (deadlineMs) => renderHook(({ deadline }) => useAppealSlaTimer(deadline), {
  initialProps: { deadline: typeof deadlineMs === 'number' ? iso(deadlineMs) : deadlineMs },
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(T0);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useAppealSlaTimer', () => {
  test('1. initial remainingMs = deadline − now', async () => {
    vi.stubGlobal('fetch', serverClock());
    const { result } = mount(T0 + HOUR);
    await flush();
    expect(result.current.remainingMs).toBe(HOUR);
    expect(result.current.isExpired).toBe(false);
  });

  test('2. advancing 5 s reduces remainingMs by exactly 5000', async () => {
    vi.stubGlobal('fetch', serverClock());
    const { result } = mount(T0 + HOUR);
    await flush();
    await advance(5 * SECOND);
    expect(result.current.remainingMs).toBe(HOUR - 5 * SECOND);
  });

  test('3. zero drift: a clock jump without ticks is fully reflected on the next tick', async () => {
    vi.stubGlobal('fetch', serverClock());
    const { result } = mount(T0 + HOUR);
    await flush();

    // Simulate a throttled/sleeping tab: 30 s pass but no timer fires
    vi.setSystemTime(T0 + 30 * SECOND);
    await advance(SECOND);

    // A decrementing timer would show HOUR − 1 s here
    expect(result.current.remainingMs).toBe(HOUR - 31 * SECOND);
  });

  test('4. server clock offset (+60 s) is applied', async () => {
    vi.stubGlobal('fetch', serverClock(60 * SECOND));
    const { result } = mount(T0 + HOUR);
    await flush();
    expect(result.current.isSynced).toBe(true);
    expect(result.current.remainingMs).toBe(HOUR - 60 * SECOND);
  });

  test('5. failed sync falls back to the local clock without throwing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const { result } = mount(T0 + HOUR);
    await flush();
    expect(result.current.isSynced).toBe(false);
    expect(result.current.remainingMs).toBe(HOUR);
  });

  test('6. clamps at 0, sets isExpired and stops scheduling', async () => {
    vi.stubGlobal('fetch', serverClock());
    const { result } = mount(T0 + 3 * SECOND);
    await flush();
    await advance(3 * SECOND);
    expect(result.current.remainingMs).toBe(0);
    expect(result.current.isExpired).toBe(true);
    expect(vi.getTimerCount()).toBe(0);

    await advance(10 * SECOND);
    expect(result.current.remainingMs).toBe(0);
  });

  test('7. visibilitychange → visible recomputes immediately and re-syncs', async () => {
    const fetchMock = serverClock();
    vi.stubGlobal('fetch', fetchMock);
    const { result } = mount(T0 + HOUR);
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.setSystemTime(T0 + 20 * SECOND);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.remainingMs).toBe(HOUR - 20 * SECOND);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test('8. unmount clears timers, removes the listener and aborts the sync request', async () => {
    let capturedSignal;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url, { signal }) => {
        capturedSignal = signal;
        return new Promise(() => {}); // never resolves
      }),
    );
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = mount(T0 + HOUR);
    await flush();
    unmount();

    expect(capturedSignal.aborted).toBe(true);
    expect(removeSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });

  test('9. parts split remainingMs into d/h/m/s', async () => {
    vi.stubGlobal('fetch', serverClock());
    const { result } = mount(T0 + DAY + 2 * HOUR + 3 * MINUTE + 4 * SECOND);
    await flush();
    expect(result.current.parts).toEqual({ d: 1, h: 2, m: 3, s: 4 });
  });

  test('10. invalid deadline is treated as expired', async () => {
    vi.stubGlobal('fetch', serverClock());
    const { result } = mount('not-a-date');
    await flush();
    expect(result.current.remainingMs).toBe(0);
    expect(result.current.isExpired).toBe(true);
  });

  test('11. hook source never decrements a previous value', () => {
    expect(hookSource).not.toMatch(/\b(prev|r|ms|remaining|remainingMs)\s*-\s*(1000|SECOND|\d)/);
    expect(hookSource).not.toMatch(/setRemaining/);
  });
});
