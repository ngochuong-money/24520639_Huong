import { DROP_PHASE } from './contract.js';
import { formatCountdown, toIsoDuration } from './formatters.js';

const PHASE_LABEL = Object.freeze({
  [DROP_PHASE.WARMUP]: 'Warmup',
  [DROP_PHASE.AIRDROP_LIVE]: 'Airdrop live',
  [DROP_PHASE.LOOTED_OUT]: 'Looted out',
  [DROP_PHASE.EXPIRED]: 'Expired',
});

const TIMER_PREFIX = Object.freeze({
  [DROP_PHASE.WARMUP]: 'Drops in',
  [DROP_PHASE.AIRDROP_LIVE]: 'Ends in',
});

export default function AirdropCountdown({ title, phase, remainingMs }) {
  const timerPrefix = TIMER_PREFIX[phase];

  return (
    <p className="airdrop-countdown">
      <span role="status" className={`phase-badge phase-badge--${phase.toLowerCase()}`}>
        <span className="visually-hidden">{title}: </span>
        {PHASE_LABEL[phase]}
      </span>
      {timerPrefix && (
        <>
          {' '}
          {timerPrefix}{' '}
          <time dateTime={toIsoDuration(remainingMs)}>{formatCountdown(remainingMs)}</time>
        </>
      )}
    </p>
  );
}