import { useId, useState } from 'react';
import { formatClock } from './formatters.js';

const ROW_HEIGHT = 64;
const VIEWPORT_HEIGHT = 320;
const OVERSCAN = 4;
const VISIBLE_ROWS = Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT);

export default function KillFeedVirtualList({ entries, squadName }) {
  const [firstVisibleRow, setFirstVisibleRow] = useState(0);
  const headingId = useId();
  const summaryId = useId();

  const startIndex = Math.max(0, firstVisibleRow - OVERSCAN);
  const endIndex = Math.min(entries.length, firstVisibleRow + VISIBLE_ROWS + OVERSCAN);
  const visibleEntries = entries.slice(startIndex, endIndex);

  const handleScroll = (event) => {
    setFirstVisibleRow(Math.floor(event.currentTarget.scrollTop / ROW_HEIGHT));
  };

  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId}>Kill-feed</h3>
      <p id={summaryId}>
        {entries.length} kills{squadName ? ` involving ${squadName}` : ''}, newest first.
      </p>
      <ol
        className="kill-feed"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- scrollable region must be keyboard-focusable (WCAG 2.1.1)
        tabIndex={0}
        aria-labelledby={headingId}
        aria-describedby={summaryId}
        onScroll={handleScroll}
        style={{ height: VIEWPORT_HEIGHT }}
      >
        <li
          aria-hidden="true"
          className="kill-feed__spacer"
          style={{ height: startIndex * ROW_HEIGHT }}
        />
        {visibleEntries.map((entry, offset) => (
          <li
            key={entry.id}
            className="kill-feed__row"
            style={{ height: ROW_HEIGHT }}
            aria-setsize={entries.length}
            aria-posinset={startIndex + offset + 1}
          >
            <span className="kill-feed__line">
              <strong>{entry.killerName}</strong> eliminated <strong>{entry.victimName}</strong>
            </span>
            <span className="kill-feed__line kill-feed__meta">
              {entry.weapon} ·{' '}
              <time dateTime={new Date(entry.timestampMs).toISOString()}>
                {formatClock(entry.timestampMs)}
              </time>
            </span>
          </li>
        ))}
        <li
          aria-hidden="true"
          className="kill-feed__spacer"
          style={{ height: (entries.length - endIndex) * ROW_HEIGHT }}
        />
      </ol>
    </section>
  );
}