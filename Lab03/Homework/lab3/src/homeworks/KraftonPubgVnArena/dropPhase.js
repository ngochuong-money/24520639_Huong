import { DROP_PHASE } from './contract.js';

/**
 * Derives a drop's phase from time and stock. Rules are ordered by priority.
 * @param {{ hasStarted: boolean, hasExpired: boolean, remainingStock: number }} input
 * @returns {import('./contract.js').DropPhase}
 */
export function getDropPhase({ hasStarted, hasExpired, remainingStock }) {
  if (hasExpired) return DROP_PHASE.EXPIRED;
  if (!hasStarted) return DROP_PHASE.WARMUP;
  if (remainingStock <= 0) return DROP_PHASE.LOOTED_OUT;
  return DROP_PHASE.AIRDROP_LIVE;
}