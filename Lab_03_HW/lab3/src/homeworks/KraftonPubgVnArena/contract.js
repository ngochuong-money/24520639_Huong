/**
 * KRAFTON x PUBG Vietnam Arena — domain contract (JSDoc).
 * Own contract for HW3; the slide's TS contract is reference only.
 */

/** Kinds of claimable airdrop items. */
export const DROP_KIND = Object.freeze({
  VIP_TICKET: 'VIP_TICKET',
  G_COIN_CRATE: 'G_COIN_CRATE',
});

/** Lifecycle phases of a drop. */
export const DROP_PHASE = Object.freeze({
  WARMUP: 'WARMUP',
  AIRDROP_LIVE: 'AIRDROP_LIVE',
  LOOTED_OUT: 'LOOTED_OUT',
  EXPIRED: 'EXPIRED',
});

/**
 * Allowed phase transitions (explicit state machine).
 * LOOTED_OUT -> AIRDROP_LIVE exists only for optimistic rollback
 * when a claim that took the last unit fails.
 */
export const PHASE_TRANSITIONS = Object.freeze({
  [DROP_PHASE.WARMUP]: Object.freeze([DROP_PHASE.AIRDROP_LIVE]),
  [DROP_PHASE.AIRDROP_LIVE]: Object.freeze([
    DROP_PHASE.LOOTED_OUT,
    DROP_PHASE.EXPIRED,
  ]),
  [DROP_PHASE.LOOTED_OUT]: Object.freeze([
    DROP_PHASE.AIRDROP_LIVE,
    DROP_PHASE.EXPIRED,
  ]),
  [DROP_PHASE.EXPIRED]: Object.freeze([]),
});

/**
 * @param {DropPhase} from
 * @param {DropPhase} to
 * @returns {boolean}
 */
export const canTransition = (from, to) =>
  from === to || (PHASE_TRANSITIONS[from]?.includes(to) ?? false);

/**
 * @typedef {'VIP_TICKET' | 'G_COIN_CRATE'} DropKind
 */

/**
 * @typedef {'WARMUP' | 'AIRDROP_LIVE' | 'LOOTED_OUT' | 'EXPIRED'} DropPhase
 */

/**
 * A claimable PVS Finals ticket or G-Coin crate.
 * @typedef {Object} CrateDrop
 * @property {string} id              Stable unique id (used as React key).
 * @property {DropKind} kind
 * @property {string} title           e.g. "PVS Grand Finals VIP Ticket".
 * @property {number} priceVnd        Integer VND, formatted with Intl vi-VN.
 * @property {number} gCoinAmount     G-Coin included (0 for tickets).
 * @property {number} totalStock
 * @property {number} remainingStock  0 ≤ remainingStock ≤ totalStock.
 * @property {number} dropEpochMs     When the drop goes live (epoch ms).
 * @property {number} expireEpochMs   When the drop closes (epoch ms).
 */

/**
 * A Vietnamese squad's championship standing.
 * @typedef {Object} SquadStanding
 * @property {string} squadId         Stable unique id.
 * @property {string} squadName       e.g. "Cerberus Esports".
 * @property {number} wwcdCount       Winner Winner Chicken Dinner count.
 * @property {number} placementPts
 * @property {number} killPts
 */

/**
 * One kill-feed event.
 * @typedef {Object} KillFeedEntry
 * @property {string} id              Stable unique id.
 * @property {string} killerSquadId   References SquadStanding.squadId.
 * @property {string} killerName
 * @property {string} victimSquadId   References SquadStanding.squadId.
 * @property {string} victimName
 * @property {string} weapon
 * @property {number} timestampMs     Epoch ms.
 */