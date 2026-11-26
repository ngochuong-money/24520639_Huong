import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ApiError } from '../../api/client.js'
import DeckErrorMessage from './DeckErrorMessage.jsx'

describe('DeckErrorMessage', () => {
  it('renders nothing when there is no error', () => {
    const { container } = render(<DeckErrorMessage error={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('announces a real error with role="alert"', () => {
    render(<DeckErrorMessage error={new ApiError(0, 'NETWORK_ERROR', 'x')} />)
    expect(screen.getByRole('alert')).toHaveTextContent(/connection lost/i)
  })

  it.each([
    ['NETWORK_ERROR', /connection lost/i],
    ['ALREADY_SWIPED', /already swiped/i],
    ['CARD_NOT_FOUND', /no longer exists/i],
    ['INTERNAL_ERROR', /something went wrong/i],
    ['SOMETHING_NEW', /something went wrong/i],
  ])('maps %s to a friendly message', (code, pattern) => {
    render(<DeckErrorMessage error={new ApiError(500, code, 'raw server text')} />)
    expect(screen.getByRole('alert')).toHaveTextContent(pattern)
  })

  it('never shows the raw server message', () => {
    render(<DeckErrorMessage error={new ApiError(500, 'INTERNAL_ERROR', 'mongodb://user:secret@host')} />)
    expect(screen.getByRole('alert').textContent).not.toContain('secret')
  })

  it('uses no div elements', () => {
    const { container } = render(<DeckErrorMessage error={new ApiError(0, 'NETWORK_ERROR', 'x')} />)
    expect(container.querySelectorAll('div')).toHaveLength(0)
  })
})

  it.each(['constructor', 'toString', '__proto__'])('uses a safe fallback for inherited code %s', (code) => {
    render(<DeckErrorMessage error={new ApiError(500, code, 'secret')} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.')
  })
