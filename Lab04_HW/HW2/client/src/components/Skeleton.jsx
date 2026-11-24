const DOSSIER_ROWS = 6;

export default function Skeleton({ variant = 'dossier' }) {
  const isAppeal = variant === 'appeal';

  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className={isAppeal ? 'appeal skeleton' : 'dossier skeleton'}
    >
      <span className="visually-hidden">
        {isAppeal ? 'Loading appeal form…' : 'Loading dossier…'}
      </span>

      <span className={isAppeal ? 'sk-bar sk-h3' : 'sk-bar sk-h2'} aria-hidden="true" />

      {isAppeal ? (
        <span className="sk-bar sk-text" aria-hidden="true" />
      ) : (
        <>
          <span className="person-details sk-grid" aria-hidden="true">
            {Array.from({ length: DOSSIER_ROWS }, (_, row) => (
              <span key={`row-${row}`} className="sk-row">
                <span className="sk-bar sk-text sk-label" />
                <span className="sk-bar sk-text" />
              </span>
            ))}
          </span>
          <span className="sk-bar sk-button" aria-hidden="true" />
        </>
      )}
    </section>
  );
}
