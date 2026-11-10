import { useId } from 'react';

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

export default function HitLog({ hits, latestHit }) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId}>Hit log</h3>
      <output aria-live="polite">
        {latestHit ? (
          // New key per hit → new node, so repeated hits on the same pad are still announced.
          <span key={latestHit.id}>
            {latestHit.name} ({latestHit.keyLabel}), {latestHit.level} dB
          </span>
        ) : (
          'No hits yet'
        )}
      </output>
      {hits.length > 0 && (
        <ol>
          {hits.map((hit) => (
            <li key={hit.id}>
              <kbd>{hit.keyLabel}</kbd> {hit.name} <data value={hit.level}>{hit.level} dB</data>{' '}
              <time dateTime={new Date(hit.time).toISOString()}>{timeFormat.format(hit.time)}</time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}