import AirdropCountdown from './AirdropCountdown.jsx';
import { DROP_PHASE } from './contract.js';
import { formatDropTitle, formatVnd } from './formatters.js';
import { useDropPhase } from './useDropPhase.js';

const CLAIM_LABEL = Object.freeze({
  [DROP_PHASE.WARMUP]: 'Not live yet',
  [DROP_PHASE.AIRDROP_LIVE]: 'Claim',
  [DROP_PHASE.LOOTED_OUT]: 'Looted out',
  [DROP_PHASE.EXPIRED]: 'Closed',
});

export default function CrateDropCard({ drop, isClaiming = false, onClaim }) {
  const { phase, remainingMs } = useDropPhase(drop);
  const displayTitle = formatDropTitle(drop);
  const isLive = phase === DROP_PHASE.AIRDROP_LIVE;

  return (
    <article className="pubg-arena__drop">
      <h4>{displayTitle}</h4>
      <dl className="drop-facts">
        <dt>Price</dt>
        <dd>{formatVnd(drop.priceVnd)}</dd>
        <dt>Stock</dt>
        <dd>
          {drop.remainingStock} / {drop.totalStock} left
        </dd>
      </dl>
      <AirdropCountdown title={displayTitle} phase={phase} remainingMs={remainingMs} />
      <button
        type="button"
        className="claim-button"
        disabled={!isLive || isClaiming}
        onClick={() => onClaim?.(drop.id)}
      >
        {isClaiming ? 'Claiming…' : CLAIM_LABEL[phase]}
        <span className="visually-hidden"> {displayTitle}</span>
      </button>
    </article>
  );
}