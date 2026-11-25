import { useId } from 'react';
import { useOutletContext } from 'react-router';
import SimpleForm from './SimpleForm.jsx';

export default function AppealPage() {
  const { player, isExpired } = useOutletContext();
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="appeal">
      <h3 id={headingId}>File an appeal</h3>
      <SimpleForm player={player} isExpired={isExpired} />
    </section>
  );
}
