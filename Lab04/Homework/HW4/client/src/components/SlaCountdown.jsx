const pad = (n) => String(n).padStart(2, '0');

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const milestoneText = (remainingMs) => {
  if (remainingMs === 0) return 'The appeal window has closed.';
  if (remainingMs <= 10 * MINUTE) return 'Less than 10 minutes left to appeal.';
  if (remainingMs <= HOUR) return 'Less than 1 hour left to appeal.';
  if (remainingMs <= DAY) return 'Less than 24 hours left to appeal.';
  return '';
};

export default function SlaCountdown({ remainingMs, isExpired, parts, isSynced }) {
  const { d, h, m, s } = parts;

  return (
    <>
      {isExpired ? (
        <p className="sla sla--expired">Appeal window closed</p>
      ) : (
        <p className="sla">
          Appeal window closes in{' '}
          <time dateTime={`P${d}DT${h}H${m}M${s}S`} className="sla-time">
            {`${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`}
          </time>
          {!isSynced && <small className="sla-note"> (local clock)</small>}
        </p>
      )}
      <p className="visually-hidden" aria-live="polite">
        {milestoneText(remainingMs)}
      </p>
    </>
  );
}
