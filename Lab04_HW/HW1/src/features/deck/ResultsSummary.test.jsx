import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ResultsSummary from './ResultsSummary.jsx'

const cards = [
  { id: 'a', name: 'Minh Anh', bio: '', imageUrl: '/a.svg' },
  { id: 'b', name: 'Gia Bao', bio: '', imageUrl: '/b.svg' },
  { id: 'c', name: 'Thu Ha', bio: '', imageUrl: '/c.svg' },
]
const history = [
  { cardId: 'a', direction: 'right' },
  { cardId: 'b', direction: 'left' },
  { cardId: 'c', direction: 'right' },
]

describe('ResultsSummary structure', () => {
  it('is a labelled section with a heading', () => {
    render(<ResultsSummary history={history} cards={cards} score={15} />)
    expect(screen.getByRole('region', { name: 'Results' })).toBeInTheDocument()
  })

  it('renders the history as a definition list', () => {
    render(<ResultsSummary history={history} cards={cards} score={15} />)
    const list = screen.getByRole('region', { name: 'Results' }).querySelector('dl')
    expect(list).not.toBeNull()
  })

  it('lists each swipe in history order with the card name and direction', () => {
    const { container } = render(<ResultsSummary history={history} cards={cards} score={15} />)
    const terms = Array.from(container.querySelectorAll('dt')).map((dt) => dt.textContent)
    const details = Array.from(container.querySelectorAll('dd')).map((dd) => dd.textContent)
    expect(terms.slice(0, 3)).toEqual(['Minh Anh', 'Gia Bao', 'Thu Ha'])
    expect(details.slice(0, 3)).toEqual(['Right', 'Left', 'Right'])
  })

  it('shows the total score as the last term and detail', () => {
    const { container } = render(<ResultsSummary history={history} cards={cards} score={15} />)
    const terms = container.querySelectorAll('dt')
    const details = container.querySelectorAll('dd')
    expect(terms[terms.length - 1]).toHaveTextContent('Total score')
    expect(details[details.length - 1]).toHaveTextContent('15')
  })

  it('uses only dt, dd and no div elements inside the list', () => {
    const { container } = render(<ResultsSummary history={history} cards={cards} score={15} />)
    const dl = container.querySelector('dl')
    expect(dl.querySelectorAll('div')).toHaveLength(0)
    Array.from(dl.children).forEach((child) => {
      expect(['DT', 'DD']).toContain(child.tagName)
    })
  })

  it('uses no div elements anywhere', () => {
    const { container } = render(<ResultsSummary history={history} cards={cards} score={15} />)
    expect(container.querySelectorAll('div')).toHaveLength(0)
  })
})

describe('ResultsSummary data handling', () => {
  it('shows "Unknown card" for a history entry whose card is missing', () => {
    const { container } = render(
      <ResultsSummary history={[{ cardId: 'zzz', direction: 'left' }]} cards={cards} score={-5} />,
    )
    expect(container.querySelector('dt')).toHaveTextContent('Unknown card')
  })

  it('renders an empty history with only the total score', () => {
    const { container } = render(<ResultsSummary history={[]} cards={cards} score={0} />)
    const terms = container.querySelectorAll('dt')
    expect(terms).toHaveLength(1)
    expect(terms[0]).toHaveTextContent('Total score')
  })

  it('shows a negative score as is', () => {
    const { container } = render(
      <ResultsSummary history={[{ cardId: 'a', direction: 'left' }]} cards={cards} score={-5} />,
    )
    const details = container.querySelectorAll('dd')
    expect(details[details.length - 1]).toHaveTextContent('-5')
  })

  it('does not write to the console for a missing card', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ResultsSummary history={[{ cardId: 'zzz', direction: 'left' }]} cards={cards} score={-5} />)
    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })
})

describe('ResultsSummary keys', () => {
  it('renders without React key warnings (keys come from cardId, not index)', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ResultsSummary history={history} cards={cards} score={15} />)
    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })
})

describe('ResultsSummary defensive direction labels', () => {
  it.each(['up', 'constructor', 'toString'])('labels an unknown direction %s without reading inherited properties', (direction) => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const { container } = render(<ResultsSummary history={[{ cardId: 'a', direction }]} cards={cards} score={0} />)
      expect(container.querySelector('dd')).toHaveTextContent('Unknown')
      expect(error).not.toHaveBeenCalled()
    } finally {
      error.mockRestore()
    }
  })
})
