import { Link } from 'react-router';

export default function NotFoundState() {
  return (
    <section className="detail-pane not-found" role="alert" aria-labelledby="not-found-heading">
      <h2 id="not-found-heading">Person not found</h2>
      <p>The person you are looking for does not exist or was removed.</p>
      <Link to="/people">Back to directory</Link>
    </section>
  );
}
