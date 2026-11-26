import './DeckControls.css'

export default function DeckControls({ canSwipe = true, canUndo = false, onSwipe, onUndo }) {
  return (
    <section className="deck-controls" aria-label="Deck controls">
      <button type="button" className="deck-control" disabled={!canSwipe} onClick={() => onSwipe('left')}>
        Swipe left
      </button>
      <button type="button" className="deck-control" disabled={!canSwipe} onClick={() => onSwipe('right')}>
        Swipe right
      </button>
      <button type="button" className="deck-control" disabled={!canUndo} onClick={() => onUndo()}>
        Undo
      </button>
    </section>
  )
}
