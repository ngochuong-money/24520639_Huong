import { Fragment, Suspense, useId, useState } from 'react';
import { useParams, Link, Outlet } from 'react-router';
import NotFoundState from './NotFoundState.jsx';
import Skeleton from './Skeleton.jsx';
import SlaCountdown from './SlaCountdown.jsx';
import { useAppealSlaTimer } from '../hooks/useAppealSlaTimer.js';
import AppealHistory from './AppealHistory.jsx';
import TribunalChannels from './TribunalChannels.jsx';

const deadlineFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Ho_Chi_Minh',
});

export default function PersonDetail({ players = [] }) {
  const { playerID } = useParams();
  const headingId = useId();
  const [historyKey, setHistoryKey] = useState(0);
  const person = players.find((p) => p.id === playerID);
  const sla = useAppealSlaTimer(person?.appealDeadline); // before any early return (Rules of Hooks)

  if (!person) {
    return <NotFoundState message={`No dossier exists for "${playerID}".`} />;
  }

  const fields = [
    { label: 'Team', value: person.team },
    { label: 'Role', value: person.role },
    { label: 'Violation', value: person.violation },
    { label: 'Match ID', value: person.matchId },
    { label: 'Sanction', value: person.sanction },
    {
      label: 'Appeal deadline',
      value: (
        <time dateTime={person.appealDeadline}>
          {deadlineFormatter.format(new Date(person.appealDeadline))}
        </time>
      ),
    },
  ];

  return (
    <article aria-labelledby={headingId} className="dossier">
      <h2 id={headingId}>{person.name}</h2>
      <SlaCountdown {...sla} />
      <dl className="person-details">
        {fields.map(({ label, value }) => (
          <Fragment key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </Fragment>
        ))}
      </dl>
      <AppealHistory playerId={person.id} reloadKey={historyKey} />
      <Link to="appeal" className="action-link">
        File an appeal
      </Link>
      <Suspense fallback={<Skeleton variant="appeal" />}>
        <Outlet
          context={{
            player: person,
            isExpired: sla.isExpired,
            onAppealSubmitted: () => setHistoryKey((key) => key + 1),
          }}
        />
      </Suspense>
      <TribunalChannels />
    </article>
  );
}
