import { useId } from 'react';

export default function AppealPage() {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="appeal">
      <h3 id={headingId}>File an appeal</h3>
      <p>The appeal form will be available in Sprint 2.</p>
    </section>
  );
}
