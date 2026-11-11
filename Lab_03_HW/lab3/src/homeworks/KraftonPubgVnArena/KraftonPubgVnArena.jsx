import { useEffect, useId, useState } from 'react';
import CrateDropCard from './CrateDropCard.jsx';
import { createMockDrops } from './data.js';
import { createMockClaimApi } from './mockClaimApi.js';
import { useOptimisticClaim } from './useOptimisticClaim.js';
import './KraftonPubgVnArena.css';

export default function KraftonPubgVnArena() {
  const [arena] = useState(() => {
    const initialDrops = createMockDrops(Date.now());
    return { initialDrops, api: createMockClaimApi(initialDrops) };
  });
  const { drops, pendingDropIds, statusMessage, claim } = useOptimisticClaim(
    arena.initialDrops,
    arena.api,
  );
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
    </section>
  );
}