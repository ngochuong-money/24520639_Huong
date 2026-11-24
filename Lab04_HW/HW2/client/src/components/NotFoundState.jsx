import { Link } from 'react-router';

export default function NotFoundState({
  title = 'Dossier not found',
  message = 'The requested page does not exist.',
}) {
  return (
    <section role="alert">
      <h2>404 — {title}</h2>
      <p>{message}</p>
      <Link to="/dossier">Back to case list</Link>
    </section>
  );
}
