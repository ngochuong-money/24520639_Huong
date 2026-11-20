import { useId } from 'react'
import DeckControls from './DeckControls.jsx'
import DeckErrorMessage from './DeckErrorMessage.jsx'
import DeckStatus from './DeckStatus.jsx'
import ResultsSummary from './ResultsSummary.jsx'
import SwipeCard from './SwipeCard.jsx'
import { useDeckKeyboard } from './useDeckKeyboard.js'
import { useSwipePersistence } from './useSwipePersistence.js'
import Skeleton from '../../components/Skeleton.jsx'

export default function DeckPage() {
  const headingId = useId()
  const deck = useSwipePersistence()
  useDeckKeyboard({ onSwipe: deck.swipe, onUndo: deck.undo, enabled: deck.status === 'ready' })

  if (deck.status === 'loading') {
    return <Skeleton variant="deck" />
  }

  if (deck.status === 'error') {
    return (
      <section className="page" aria-labelledby={headingId}>
        <h1 id={headingId} className="page-title">Swipe Deck</h1>
        <DeckErrorMessage error={deck.error} />
        <button type="button" onClick={deck.retry}>Try again</button>
      </section>
    )
  }

  const finished = deck.currentCard === null && deck.history.length > 0

  return (
    <section className="page" aria-labelledby={headingId}>
      <h1 id={headingId} className="page-title">Swipe Deck</h1>
      <p className="page-line">Score: {deck.score}</p>
      {finished ? (
        <ResultsSummary history={deck.history} cards={deck.cards} score={deck.score} />
      ) : deck.currentCard ? (
        <SwipeCard key={deck.currentCard.id} card={deck.currentCard} onSwipe={deck.swipe} disabled={!deck.canSwipe} />
      ) : (
        <p className="page-line">No cards available.</p>
      )}
      <DeckControls canSwipe={deck.canSwipe} canUndo={deck.canUndo && !deck.isSyncing} onSwipe={deck.swipe} onUndo={deck.undo} />
      <DeckStatus message={finished ? 'No more cards.' : ''} />
      <DeckErrorMessage error={deck.error} />
    </section>
  )
}
