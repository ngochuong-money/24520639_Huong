/** Resolves after `ms`; rejects with the signal's AbortError if aborted first. */
export function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const onAbort = () => {
      clearTimeout(timeoutId);
      reject(signal.reason);
    };
    const timeoutId = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Replays recorded notes in FIFO order. Onsets are scheduled against one start time,
 * so timer delays do not accumulate (no drift across long sequences).
 * @param {Array<{ midi: number, durationMs: number | null, deltaMs: number }>} events
 * @param {{ speed: number, signal?: AbortSignal, onNoteOn: (midi: number) => void, onNoteOff: (midi: number) => void }} options
 */
export async function playSequence(events, { speed, signal, onNoteOn, onNoteOff }) {
  const startedAt = performance.now();
  const releases = [];
  let onsetMs = 0;

  for (const { midi, deltaMs, durationMs } of events) {
    onsetMs += deltaMs / speed;
    await sleep(Math.max(0, startedAt + onsetMs - performance.now()), signal);
    onNoteOn(midi);

    const release = sleep((durationMs ?? 0) / speed, signal).then(() => onNoteOff(midi));
    release.catch(() => {}); // handled by the abort path; avoid unhandled rejections
    releases.push(release);
  }

  await Promise.all(releases);
}