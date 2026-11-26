export default function Skeleton() {
  return (
    <main className="page" aria-busy="true" aria-live="polite">
      <span className="visually-hidden">Loading page…</span>
      <h1 className="sk-text" aria-hidden="true">Loading</h1>
      <span className="sk-block sk-panel" aria-hidden="true" />
    </main>
  );
}
