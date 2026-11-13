import { useParams } from 'react-router';
import { people } from './data/people.js';
import NotFoundState from './NotFoundState.jsx';

export default function PersonDetail() {
  const { id } = useParams();
  const person = people.find((person) => person.id === id);

  if (!person) {
    return <NotFoundState />;
  }

  return (
    <section className="detail-pane person-detail" aria-labelledby="person-heading">
      <h2 id="person-heading">{person.name}</h2>
      <dl className="person-details">
        <dt>ID</dt>
        <dd>{person.id}</dd>
        <dt>Name</dt>
        <dd>{person.name}</dd>
        <dt>Role</dt>
        <dd>{person.role}</dd>
      </dl>
    </section>
  );
}
