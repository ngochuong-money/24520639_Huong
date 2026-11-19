import { useId } from 'react'

export default function DeckPage() {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId}>
      <h1 id={headingId}>Swipe Deck</h1>
    </section>
  )
}
