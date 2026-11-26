import { useId } from 'react';
import { useSwipeDeck } from '../hooks/useSwipeDeck.js';
import { useSwipeGestures } from '../hooks/useSwipeGestures.js';
import SwipeCard from './SwipeCard.jsx';
import SwipeControls from './SwipeControls.jsx';
import ScoreBoard from './ScoreBoard.jsx';

export default function SwipeDeck() {
  const headingId = useId();
  const hintId = useId();
  const deck = useSwipeDeck();
  const gestures = useSwipeGestures({
    onSwipe: deck.swipe,
    onUndo: deck.undo,
    enabled: !deck.loading && !deck.error,
  });

  return (
    <section
      aria-labelledby={headingId}
      aria-describedby={hintId}
      tabIndex={0}
      className="swipe-deck"
      {...gestures.keyHandlers}
    >
      <h2 id={headingId} className="visually-hidden">Profile deck</h2>
      <p id={hintId} className="swipe-hint">Use ← to pass, → to like, ↑ to super like, Backspace to undo.</p>

      {deck.error && <p role="alert" className="swipe-error">{deck.error}</p>}
      {deck.loading && <p className="swipe-status">Loading profiles…</p>}

      <ScoreBoard score={deck.score} remainingCount={deck.remainingCount} />

      {deck.currentProfile && (
        <SwipeCard
          key={deck.currentProfile.id}
          profile={deck.currentProfile}
          pointerHandlers={gestures.pointerHandlers}
          dragOffset={gestures.dragOffset}
          isDragging={gestures.isDragging}
        />
      )}

      {deck.isFinished && (
        <p className="swipe-finished">
          You have seen everyone.{' '}
          <button type="button" className="control control--reset" onClick={deck.reset}>Start over</button>
        </p>
      )}

      <SwipeControls
        profileName={deck.currentProfile?.name}
        canSwipe={Boolean(deck.currentProfile)}
        canUndo={deck.canUndo}
        onSwipe={deck.swipe}
        onUndo={deck.undo}
      />

      <p className="visually-hidden" aria-live="polite">{deck.announcement}</p>
    </section>
  );
}
