import { useId } from 'react';
import { useAbortableGet } from '../hooks/useAbortableGet.js';
import { APPEAL_REASONS } from '@shared/validateAppeal.js';

const dateFormatter = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' });
const reasonLabel = (value) => APPEAL_REASONS.find((r) => r.value === value)?.label ?? value;

export default function AppealHistory({ playerId, reloadKey = 0 }) {
  const headingId = useId();
  const { data, loading, error } = useAbortableGet(`/api/appeals/${encodeURIComponent(playerId)}`, {
    reloadKey,
    errorMessage: 'Could not load appeal history.',
  });
  const appeals = Array.isArray(data) ? data : [];

  return (
    <section aria-labelledby={headingId} aria-busy={loading} className="history">
      <h3 id={headingId}>Appeal history</h3>
      {error && <p role="alert" className="field-error">{error}</p>}
      {!loading && !error && appeals.length === 0 && <p>No appeals filed yet.</p>}
      {appeals.length > 0 && (
        <ol className="history-list">
          {appeals.map((appeal) => (
            <li key={appeal.id}>
              <p className="history-meta">
                <time dateTime={appeal.createdAt}>{dateFormatter.format(new Date(appeal.createdAt))}</time>
                {' · '}{reasonLabel(appeal.reason)}{' · '}{appeal.matchId}
              </p>
              <p>{appeal.statement}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
