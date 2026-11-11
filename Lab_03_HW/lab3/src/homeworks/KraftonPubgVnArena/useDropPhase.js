import { usePubgAirdropTimer } from '../../hooks/usePubgAirdropTimer.js';
import { DROP_PHASE } from './contract.js';
import { getDropPhase } from './dropPhase.js';

/**
 * Combines the drop-start and expiry timers into the drop's current phase.
 * @param {import('./contract.js').CrateDrop} drop
 * @returns {{ phase: import('./contract.js').DropPhase, remainingMs: number }}
 */
export function useDropPhase(drop) {
  const start = usePubgAirdropTimer(drop.dropEpochMs);
  const expiry = usePubgAirdropTimer(drop.expireEpochMs);

  const phase = getDropPhase({
    hasStarted: start.isLive,
    hasExpired: expiry.isLive,
    remainingStock: drop.remainingStock,
  });

  const remainingMs =
    phase === DROP_PHASE.WARMUP
      ? start.remainingMs
      : phase === DROP_PHASE.AIRDROP_LIVE
        ? expiry.remainingMs
        : 0;

  return { phase, remainingMs };
}