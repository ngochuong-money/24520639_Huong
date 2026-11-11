export const ALL_SQUADS = 'all';

export const SORT_OPTIONS = Object.freeze([
  Object.freeze({ value: 'wwcdCount', label: 'WWCD' }),
  Object.freeze({ value: 'placementPts', label: 'Placement Pts' }),
  Object.freeze({ value: 'killPts', label: 'Kill Pts' }),
]);

export const DEFAULT_SORT_KEY = SORT_OPTIONS[0].value;

/**
 * Sorts squads descending by the given key and assigns ranks.
 * Ties are broken alphabetically by squad name.
 * @param {ReadonlyArray<import('./contract.js').SquadStanding>} squads
 * @param {string} sortKey
 */
export function rankSquads(squads, sortKey) {
  return [...squads]
    .sort((a, b) => b[sortKey] - a[sortKey] || a.squadName.localeCompare(b.squadName))
    .map((squad, index) => ({ ...squad, rank: index + 1 }));
}

/**
 * @param {ReadonlyArray<{ squadId: string }>} rows
 * @param {string} squadId
 */
export const filterBySquad = (rows, squadId) =>
  squadId === ALL_SQUADS ? rows : rows.filter((row) => row.squadId === squadId);
/**
 * Keeps kills where the squad is either the killer or the victim.
 * @param {ReadonlyArray<import('./contract.js').KillFeedEntry>} entries
 * @param {string} squadId
 */
export const filterKillFeedBySquad = (entries, squadId) =>
  squadId === ALL_SQUADS
    ? entries
    : entries.filter(
        (entry) => entry.killerSquadId === squadId || entry.victimSquadId === squadId,
      );