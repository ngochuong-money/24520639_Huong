import { Fragment, useId } from 'react';
import { useParams } from 'react-router';
import { findPlayer } from '@shared/players.js';
import { useAppealSlaTimer } from '../hooks/useAppealSlaTimer.js';
import SlaCountdown from './SlaCountdown.jsx';
import DisproportionalityMatrix from './DisproportionalityMatrix.jsx';
import NotFoundState from './NotFoundState.jsx';

const deadlineFormatter = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' });

export default function DossierView() {
  const { playerID } = useParams();
  const headingId = useId();
  const player = findPlayer(playerID);
  const sla = useAppealSlaTimer(player?.appealDeadline); // before the early return (Rules of Hooks)

  if (!player) {
    return <NotFoundState title="Dossier not found" message={`No dossier exists for "${playerID}".`} />;
  }

  const fields = [
    ['Team', player.team],
    ['Role', player.role],
    ['Violation', player.violation],
    ['Violation severity', `${player.violationSeverity} / 5`],
    ['Match ID', player.matchId],
    ['Sanction', player.sanction],
    ['Sanction severity', `${player.sanctionSeverity} / 5`],
    ['Appeal deadline', <time key="deadline" dateTime={player.appealDeadline}>{deadlineFormatter.format(new Date(player.appealDeadline))}</time>],
  ];

  return (
    <main className="page">
      <article aria-labelledby={headingId} className="dossier">
        <h1 id={headingId}>{player.name}</h1>
        <SlaCountdown {...sla} />
        <dl className="person-details">
          {fields.map(([label, value]) => (
            <Fragment key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </Fragment>
          ))}
        </dl>
        <DisproportionalityMatrix dossier={player} />
      </article>
    </main>
  );
}
