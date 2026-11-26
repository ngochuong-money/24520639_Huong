const MESSAGES = {
  NETWORK_ERROR: 'Connection lost. Your last action was not saved.',
  ALREADY_SWIPED: 'That card was already swiped.',
  CARD_NOT_FOUND: 'That card no longer exists.',
}
const FALLBACK = 'Something went wrong. Please try again.'

export default function DeckErrorMessage({ error = null }) {
  if (!error) return null
  return (
    <p role="alert" className="page-line deck-error">
      {Object.hasOwn(MESSAGES, error.code) ? MESSAGES[error.code] : FALLBACK}
    </p>
  )
}
