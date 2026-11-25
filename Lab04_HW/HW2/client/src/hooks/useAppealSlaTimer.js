import { useEffect, useState } from 'react';

const SECOND = 1000;

const toParts = (ms) => {
  const totalSeconds = Math.floor(ms / SECOND);
  return {
    d: Math.floor(totalSeconds / 86_400),
    h: Math.floor(totalSeconds / 3_600) % 24,
    m: Math.floor(totalSeconds / 60) % 60,
    s: totalSeconds % 60,
  };
};

/**
 * Zero-drift countdown: remaining time is recomputed from the (server-corrected) clock
 * on every tick — never decremented.
 */
export function useAppealSlaTimer(deadlineISO, { timeUrl = '/api/time' } = {}) {
  const deadlineMs = Date.parse(deadlineISO);

  const [tickNow, setTickNow] = useState(() => Date.now());
  const [offset, setOffset] = useState(0);
  const [isSynced, setIsSynced] = useState(false);
  const [syncKey, setSyncKey] = useState(0);

  // Derived during render — pure, no Date.now() here
  const remainingMs = Number.isFinite(deadlineMs) ? Math.max(0, deadlineMs - (tickNow + offset)) : 0;
  const isExpired = remainingMs === 0;
  const parts = toParts(remainingMs);

  // 1. Sync with server clock (midpoint offset), cancellable
  useEffect(() => {
    const controller = new AbortController();

    const sync = async () => {
      const t0 = Date.now();
      try {
        const response = await fetch(timeUrl, { signal: controller.signal });
        if (!response.ok) throw new Error(`Time sync failed: HTTP ${response.status}`);
        const { now: serverNow } = await response.json();
        const t1 = Date.now();
        if (controller.signal.aborted) return;
        if (!Number.isFinite(serverNow)) throw new Error('Time sync failed: invalid payload');

        setOffset(serverNow - (t0 + t1) / 2);
        setIsSynced(true);
      } catch (err) {
        if (err.name === 'AbortError' || controller.signal.aborted) return;
        setIsSynced(false); // fall back to the local clock (offset unchanged)
      }
    };

    sync();
    return () => controller.abort();
  }, [timeUrl, syncKey]);

  // 2. Second-aligned ticks; stop scheduling once expired
  useEffect(() => {
    if (!Number.isFinite(deadlineMs)) return undefined;

    let timeoutId;
    const schedule = () => {
      const correctedNow = Date.now() + offset;
      if (deadlineMs <= correctedNow) return;
      const delay = SECOND - (correctedNow % SECOND);
      timeoutId = setTimeout(() => {
        setTickNow(Date.now());
        schedule();
      }, delay);
    };

    schedule();
    return () => clearTimeout(timeoutId);
  }, [deadlineMs, offset]);

  // 3. Tab wake-up: recompute immediately and re-sync
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      setTickNow(Date.now());
      setSyncKey((key) => key + 1);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return { remainingMs, isExpired, parts, isSynced };
}
