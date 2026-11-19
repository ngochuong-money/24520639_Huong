import { useId } from 'react'

export default function DeckPage() {
  const headingId = useId()

  return (
    <section className="page" aria-labelledby={headingId}>
      <h1 id={headingId} className="page-title">
        Swipe Deck
      </h1>
    </section>
  )
}
