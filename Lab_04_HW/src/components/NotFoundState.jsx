import { useId } from 'react'
import { Link } from 'react-router'

export default function NotFoundState({
  title = 'Page not found',
  message = 'The page you are looking for does not exist.',
  linkTo = '/gallery',
  linkLabel = 'Back to gallery',
}) {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId}>
      <h1 id={headingId}>{title}</h1>
      <p>{message}</p>
      <Link to={linkTo}>{linkLabel}</Link>
    </section>
  )
}
