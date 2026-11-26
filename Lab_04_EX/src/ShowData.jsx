import { useId } from 'react';

export default function ShowData({ data }) {
  const titleId = useId();
  if (!data) return null;

  return (
    <section className="data-inspector" aria-labelledby={titleId}>
      <h2 id={titleId}>Submitted data</h2>
      <p>Values from your most recent successful submission.</p>
      <pre>
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </section>
  );
}
