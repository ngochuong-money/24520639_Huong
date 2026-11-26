// src/Skeleton.jsx
export default function Skeleton(props) {
  return (
    <section className="detail-pane skeleton" aria-label="Loading person details" {...props}>
      <span className="skeleton-line skeleton-title" aria-hidden="true" />
      <span className="skeleton-line" aria-hidden="true" />
      <span className="skeleton-line" aria-hidden="true" />
    </section>
  );
}
