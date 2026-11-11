import { useEffect, useId, useState } from 'react';
import CrateDropCard from './CrateDropCard.jsx';
import KillFeedVirtualList from './KillFeedVirtualList.jsx';
import SquadLeaderboard from './SquadLeaderboard.jsx';
import { SQUAD_STANDINGS, createMockDrops, createMockKillFeed } from './data.js';
import { ALL_SQUADS, filterKillFeedBySquad } from './leaderboard.js';
import { createMockClaimApi } from './mockClaimApi.js';
import { useOptimisticClaim } from './useOptimisticClaim.js';
import './KraftonPubgVnArena.css';

const KILL_FEED_SIZE = 300;
export default function KraftonPubgVnArena() {
    const [arena] = useState(() => {
    const nowMs = Date.now();
    const initialDrops = createMockDrops(nowMs);
    return {
      initialDrops,
      api: createMockClaimApi(initialDrops),
      killFeed: createMockKillFeed(KILL_FEED_SIZE, nowMs),
    };
  });
  const { drops, pendingDropIds, statusMessage, claim } = useOptimisticClaim(
    arena.initialDrops,
    arena.api,
  );
  const [selectedSquadId, setSelectedSquadId] = useState(ALL_SQUADS);
  const selectedSquad = SQUAD_STANDINGS.find((squad) => squad.squadId === selectedSquadId);
  const visibleKillFeed = filterKillFeedBySquad(arena.killFeed, selectedSquadId);
  const headingId = useId();
  const dropsHeadingId = useId();

  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    window.pubgArenaApi = arena.api;
    return () => {
      delete window.pubgArenaApi;
    };
  }, [arena.api]);

  return (
    <section className="pubg-arena" aria-labelledby={headingId}>
      <h2 id={headingId}>KRAFTON x PUBG Vietnam Arena</h2>
      <p className="pubg-arena__intro">
        PVS Finals Ticket &amp; G-Coin Contraband Crate Arena: claim drops the moment they go live,
        then follow the Vietnamese squad standings and the live kill-feed.
      </p>
      <section aria-labelledby={dropsHeadingId}>
        <h3 id={dropsHeadingId}>Airdrops</h3>
        <p role="status" className="claim-status">
          {statusMessage}
        </p>
        <ul className="pubg-arena__drops">
          {drops.map((drop) => (
            <li key={drop.id}>
              <CrateDropCard
                drop={drop}
                isClaiming={pendingDropIds.has(drop.id)}
                onClaim={claim}
              />
            </li>
          ))}
        </ul>
      </section>
      <SquadLeaderboard
        squads={SQUAD_STANDINGS}
        selectedSquadId={selectedSquadId}
        onSelectedSquadChange={setSelectedSquadId}
      />
        <KillFeedVirtualList
        key={selectedSquadId}
        entries={visibleKillFeed}
        squadName={selectedSquad?.squadName}
      />
    </section>
  );
}