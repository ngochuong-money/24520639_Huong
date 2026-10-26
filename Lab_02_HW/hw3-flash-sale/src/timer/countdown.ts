
import type {
  TimerState,
  TimerTickCallback,
  TimerCleanup,
  TimerCompleteCallback,
} from '../types/timer';

export function createCountdown(
  durationMs: number,
  onTick: TimerTickCallback,
  onComplete?: TimerCompleteCallback
): TimerCleanup {
  if (!Number.isFinite(durationMs) || durationMs < 0) {
    throw new RangeError('Invalid countdown duration');
  }

  const targetTime = Date.now() + durationMs;

  const state: TimerState = {
    status: 'running',
    durationMs,
    targetTime,
    remainingMs: durationMs,
  };

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  function cleanup(): void {
    if (stopped) return;

    stopped = true;
    state.status = 'cancelled';

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  function tick(): void {
    if (stopped) return;

    timeoutId = null;

    state.remainingMs = Math.max(
      0,
      state.targetTime - Date.now()
    );

    onTick(state.remainingMs);

    // The callback may cancel the timer.
    if (stopped) return;

    if (state.remainingMs === 0) {
      stopped = true;
      state.status = 'completed';
      onComplete?.();
      return;
    }

    timeoutId = setTimeout(tick, 50);
  }

  // Start immediately.
  tick();

  return cleanup;
}
