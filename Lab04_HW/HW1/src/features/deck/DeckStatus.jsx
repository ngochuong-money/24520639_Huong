import './DeckControls.css'

// Always rendered so the layout does not shift (CLS = 0).
export default function DeckStatus({ message = '' }) {
  return (
    <p role="status" aria-live="polite" className="page-line">
      {message}
    </p>
  )
}
