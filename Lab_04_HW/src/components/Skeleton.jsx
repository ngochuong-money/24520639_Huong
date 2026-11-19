import './Skeleton.css'

// 12 = number of seeded photos, so the grid keeps the same number of rows once the data arrives.
const TILE_KEYS = Array.from({ length: 12 }, (_, index) => `tile-${index + 1}`)
const CONTROL_KEYS = ['swipe-left', 'swipe-right', 'undo']

function GalleryPlaceholders() {
  return (
    <>
      <span className="filter-row skeleton-block" aria-hidden="true" />
      <span className="page-line" aria-hidden="true" />
      <ul className="photo-grid" aria-hidden="true">
        {TILE_KEYS.map((key) => (
          <li key={key} className="photo-tile">
            <span className="photo-tile-media skeleton-block" />
            <span className="photo-tile-caption skeleton-block" />
          </li>
        ))}
      </ul>
    </>
  )
}

function DeckPlaceholders() {
  return (
    <>
      <span className="page-line" aria-hidden="true" />
      <span className="deck-card skeleton-block" aria-hidden="true" />
      <span className="deck-controls" aria-hidden="true">
        {CONTROL_KEYS.map((key) => (
          <span key={key} className="deck-control skeleton-block" />
        ))}
      </span>
      <span className="page-line" aria-hidden="true" />
    </>
  )
}

export default function Skeleton({ variant = 'gallery' }) {
  const isDeck = variant === 'deck'
  const label = isDeck ? 'Loading swipe deck' : 'Loading gallery'

  return (
    <section className="page" aria-busy="true" aria-live="polite" aria-label={label}>
      <p className="visually-hidden">{label}…</p>
      <span className="page-title skeleton-block skeleton-title" aria-hidden="true" />
      {isDeck ? <DeckPlaceholders /> : <GalleryPlaceholders />}
    </section>
  )
}
