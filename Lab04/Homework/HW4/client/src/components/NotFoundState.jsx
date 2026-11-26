import { Link } from 'react-router';

export default function NotFoundState({ title = 'Page not found', message = 'The requested page does not exist.' }) {
  return (
    <main className="page">
      <section role="alert">
        <h1>404 — {title}</h1>
        <p>{message}</p>
        <Link to="/swipe">Back to Discover</Link>
      </section>
    </main>
  );
}
