import { useId, useState } from 'react';
import {
  ALL_SQUADS,
  DEFAULT_SORT_KEY,
  SORT_OPTIONS,
  filterBySquad,
  rankSquads,
} from './leaderboard.js';

const COLUMNS = Object.freeze([
  Object.freeze({ key: 'wwcdCount', label: 'WWCD' }),
  Object.freeze({ key: 'placementPts', label: 'Placement Pts' }),
  Object.freeze({ key: 'killPts', label: 'Kill Pts' }),
]);

export default function SquadLeaderboard({ squads, selectedSquadId, onSelectedSquadChange }) {
  const [sortKey, setSortKey] = useState(DEFAULT_SORT_KEY);
  const headingId = useId();
  const squadSelectId = useId();
  const sortSelectId = useId();

  const rows = filterBySquad(rankSquads(squads, sortKey), selectedSquadId);
  const sortLabel = SORT_OPTIONS.find((option) => option.value === sortKey).label;
  const selectedSquad = squads.find((squad) => squad.squadId === selectedSquadId);

  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId}>Live PUBG VN Leaderboard</h3>

      <fieldset className="leaderboard-controls">
        <legend>Leaderboard controls</legend>
        <p className="leaderboard-control">
          <label htmlFor={squadSelectId}>Squad</label>
          <select
            id={squadSelectId}
            value={selectedSquadId}
            onChange={(event) => onSelectedSquadChange(event.target.value)}
          >
            <option value={ALL_SQUADS}>All squads</option>
            {squads.map((squad) => (
              <option key={squad.squadId} value={squad.squadId}>
                {squad.squadName}
              </option>
            ))}
          </select>
        </p>
        <p className="leaderboard-control">
          <label htmlFor={sortSelectId}>Sort by</label>
          <select
            id={sortSelectId}
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </p>
      </fieldset>

      <table className="leaderboard">
        <caption>
          Standings sorted by {sortLabel}, highest first
          {selectedSquad ? `, showing ${selectedSquad.squadName}` : ''}
        </caption>
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Squad</th>
            {COLUMNS.map((column) => (
              <th
                key={column.key}
                scope="col"
                aria-sort={column.key === sortKey ? 'descending' : undefined}
                className={column.key === sortKey ? 'is-sorted' : undefined}
              >
                {column.label}
                {column.key === sortKey && <span aria-hidden="true"> ▼</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.squadId}>
              <td>{row.rank}</td>
              <th scope="row">{row.squadName}</th>
              {COLUMNS.map((column) => (
                <td key={column.key}>{row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}