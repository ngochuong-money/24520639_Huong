import { DROP_KIND } from './contract.js';

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;

/**
 * Creates claimable drops relative to a given time.
 * @param {number} nowMs Epoch ms used as the reference point.
 * @returns {ReadonlyArray<import('./contract.js').CrateDrop>}
 */
export function createMockDrops(nowMs) {
  return Object.freeze([
    Object.freeze({
      id: 'drop-vip-finals',
      kind: DROP_KIND.VIP_TICKET,
      title: 'PVS Grand Finals VIP Ticket',
      priceVnd: 1_500_000,
      gCoinAmount: 0,
      totalStock: 5,
      remainingStock: 3,
      dropEpochMs: nowMs - SECOND_MS,
      expireEpochMs: nowMs + 10 * MINUTE_MS,
    }),
    Object.freeze({
      id: 'drop-gcoin-5000',
      kind: DROP_KIND.G_COIN_CRATE,
      title: 'G-Coin Contraband Crate',
      priceVnd: 1_190_000,
      gCoinAmount: 5_000,
      totalStock: 10,
      remainingStock: 10,
      dropEpochMs: nowMs + 15 * SECOND_MS,
      expireEpochMs: nowMs + 10 * MINUTE_MS,
    }),
    Object.freeze({
      id: 'drop-gcoin-1000',
      kind: DROP_KIND.G_COIN_CRATE,
      title: 'G-Coin Contraband Crate',
      priceVnd: 239_000,
      gCoinAmount: 1_000,
      totalStock: 4,
      remainingStock: 1,
      dropEpochMs: nowMs - SECOND_MS,
      expireEpochMs: nowMs + 10 * MINUTE_MS,
    }),
    Object.freeze({
      id: 'drop-vip-standard',
      kind: DROP_KIND.VIP_TICKET,
      title: 'PVS Grand Finals Standard Ticket',
      priceVnd: 450_000,
      gCoinAmount: 0,
      totalStock: 20,
      remainingStock: 12,
      dropEpochMs: nowMs - SECOND_MS,
      expireEpochMs: nowMs + 45 * SECOND_MS,
    }),
  ]);
}

/** @type {ReadonlyArray<import('./contract.js').SquadStanding>} */
export const SQUAD_STANDINGS = Object.freeze([
  Object.freeze({ squadId: 'te', squadName: 'The Expendables', wwcdCount: 3, placementPts: 62, killPts: 71 }),
  Object.freeze({ squadId: 'ces', squadName: 'Cerberus Esports', wwcdCount: 4, placementPts: 58, killPts: 66 }),
  Object.freeze({ squadId: 'roy', squadName: 'Roy Esports', wwcdCount: 2, placementPts: 70, killPts: 54 }),
  Object.freeze({ squadId: 'agg', squadName: 'AGG', wwcdCount: 1, placementPts: 49, killPts: 80 }),
]);

const CALLSIGNS = Object.freeze(['Viper', 'Ghost', 'Falcon', 'Tiger']);
const WEAPONS = Object.freeze(['M416', 'AKM', 'Beryl M762', 'Kar98k', 'Mini14', 'UMP45']);

const playerName = (squadId, index) =>
  `${squadId.toUpperCase()}_${CALLSIGNS[index % CALLSIGNS.length]}`;

/**
 * Creates a deterministic kill-feed, newest first.
 * @param {number} count Number of entries (large enough for virtual scrolling).
 * @param {number} endMs Timestamp of the newest entry.
 * @returns {ReadonlyArray<import('./contract.js').KillFeedEntry>}
 */
export function createMockKillFeed(count, endMs) {
  const squadCount = SQUAD_STANDINGS.length;

  return Object.freeze(
    Array.from({ length: count }, (_, index) => {
      const killer = SQUAD_STANDINGS[index % squadCount];
      const victim = SQUAD_STANDINGS[(index * 3 + 1) % squadCount];

      return Object.freeze({
        id: `kill-${index}`,
        killerSquadId: killer.squadId,
        killerName: playerName(killer.squadId, index),
        victimSquadId: victim.squadId,
        victimName: playerName(victim.squadId, index + 1),
        weapon: WEAPONS[index % WEAPONS.length],
        timestampMs: endMs - index * 7 * SECOND_MS,
      });
    }),
  );
}