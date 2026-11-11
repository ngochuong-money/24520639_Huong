import { useId, useState } from 'react';
import AirdropCountdown from './AirdropCountdown.jsx';
import { createMockDrops } from './data.js';
import { useDropPhase } from './useDropPhase.js';
import './KraftonPubgVnArena.css';

function DropCountdownItem({ drop }) {
  const { phase, remainingMs } = useDropPhase(drop);

  return (
    <article className="pubg-arena__drop">
      <h4>{drop.title}</h4>
      <AirdropCountdown title={drop.title} phase={phase} remainingMs={remainingMs} />
    </article>
  );
}

export default function KraftonPubgVnArena() {
  const [drops] = useState(() => createMockDrops(Date.now()));
  const headingId = useId();
  const dropsHeadingId = useId();

  return (
    <section className="pubg-arena" aria-labelledby={headingId}>
      <h2 id={headingId}>KRAFTON x PUBG Vietnam Arena</h2>
      <section aria-labelledby={dropsHeadingId}>
        <h3 id={dropsHeadingId}>Airdrops</h3>
        <ul className="pubg-arena__drops">
          {drops.map((drop) => (
            <li key={drop.id}>
              <DropCountdownItem drop={drop} />
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}