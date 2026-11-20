import { useId, useRef, useState } from 'react'
import './SwipeCard.css'

export const SWIPE_THRESHOLD_PX = 100

export default function SwipeCard({ card, onSwipe, disabled = false }) {
  const headingId = useId()
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef(0)
  const activePointerRef = useRef(null)

  function handlePointerDown(event) {
    if (disabled || activePointerRef.current !== null) {
      return
    }
    activePointerRef.current = event.pointerId
    startXRef.current = event.clientX
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsDragging(true)
  }

  function handlePointerMove(event) {
    if (disabled || event.pointerId !== activePointerRef.current) {
      return
    }
    setDragX(event.clientX - startXRef.current)
  }

  function finish(event, commit) {
    if (event.pointerId !== activePointerRef.current) {
      return
    }
    activePointerRef.current = null
    setIsDragging(false)
    setDragX(0)
    if (!disabled && commit && Math.abs(dragX) >= SWIPE_THRESHOLD_PX) {
      onSwipe(dragX > 0 ? 'right' : 'left')
    }
  }

  // The swipe direction uses the last rendered dragX, which is correct because
  // pointerup is dispatched after the final pointermove has been rendered.
  return (
    <article
      className="deck-card"
      aria-labelledby={headingId}
      data-dragging={isDragging}
      style={{
        transform: `translateX(${dragX}px)`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => finish(event, true)}
      onPointerCancel={(event) => finish(event, false)}
    >
      <img src={card.imageUrl} alt="" width="600" height="800" decoding="async" draggable={false} />
      <section className="deck-card-text">
        <h2 id={headingId}>{card.name}</h2>
        <p>{card.bio}</p>
      </section>
    </article>
  )
}
