import { Fragment, useId } from 'react'

const DIRECTION_LABEL = { left: 'Left', right: 'Right' }

export default function ResultsSummary({ history = [], cards = [], score = 0 }) {
  const headingId = useId()
  const cardNames = new Map(cards.map((card) => [card.id, card.name]))

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId}>Results</h2>
      <dl>
        {history.map((entry) => (
          <Fragment key={entry.cardId}>
            <dt>{cardNames.get(entry.cardId) ?? 'Unknown card'}</dt>
            <dd>{Object.hasOwn(DIRECTION_LABEL, entry.direction) ? DIRECTION_LABEL[entry.direction] : 'Unknown'}</dd>
          </Fragment>
        ))}
        <dt>Total score</dt>
        <dd>{score}</dd>
      </dl>
    </section>
  )
}
