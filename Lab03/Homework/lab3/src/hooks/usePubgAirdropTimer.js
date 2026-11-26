import { useEffect, useState } from 'react';

const TICK_MS = 250;
const SECOND_MS = 1_000;

/**
 * Pure anti-drift calculation (ported from Lab 2 createAntiDriftTimer).
 * @param {number} targetEpochMs
 * @param {number} nowMs
 * @returns {number} Remaining ms, never negative.
 */
export function getRemainingMs(targetEpochMs, nowMs) {
  if (!Number.isFinite(targetEpochMs)) return 0;
  return Math.max(0, targetEpochMs - nowMs);
}

const toWholeSeconds = (ms) => Math.ceil(ms / SECOND_MS) * SECOND_MS;

/**
 * Zero-drift countdown to a target epoch.
 * @param {number} targetEpochMs Epoch ms when the drop goes live.
 * @param {number} [serverOffsetMs=0] Server clock minus client clock.
 * @returns {{ remainingMs: number, isLive: boolean }}
 */
export function usePubgAirdropTimer(targetEpochMs, serverOffsetMs = 0) {
  const [remainingMs, setRemainingMs] = useState(() =>
    toWholeSeconds(getRemainingMs(targetEpochMs, Date.now() + serverOffsetMs)),
  );

  useEffect(() => {
    let intervalId = 0;

    const sync = () => {
      const exactMs = getRemainingMs(targetEpochMs, Date.now() + serverOffsetMs);
      setRemainingMs(toWholeSeconds(exactMs));
      if (exactMs === 0) window.clearInterval(intervalId);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') sync();
    };

    const frameId = window.requestAnimationFrame(sync);
    intervalId = window.setInterval(sync, TICK_MS);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [targetEpochMs, serverOffsetMs]);

  return { remainingMs, isLive: remainingMs === 0 };
}