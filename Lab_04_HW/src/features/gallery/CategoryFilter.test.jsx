import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CategoryFilter from './CategoryFilter.jsx'

const CATEGORIES = ['documents', 'evidence', 'scenes']

function renderFilter(props = {}) {
  const onSelect = vi.fn()
  const utils = render(
    <CategoryFilter
      categories={CATEGORIES}
      activeCategory="all"
      onSelect={onSelect}
      {...props}
    />,
  )
  return { ...utils, onSelect }
}

describe('CategoryFilter structure', () => {
  it('is a labelled nav with a native list of buttons, "All" first', () => {
    renderFilter()
    const nav = screen.getByRole('navigation', { name: 'Photo categories' })
    const items = within(nav).getAllByRole('listitem')

    expect(items).toHaveLength(CATEGORIES.length + 1)
    expect(within(items[0]).getByRole('button')).toHaveTextContent('All')
    expect(items.slice(1).map((li) => within(li).getByRole('button').textContent)).toEqual([
      'Documents',
      'Evidence',
      'Scenes',
    ])
  })

  it('renders every button with type="button"', () => {
    renderFilter()
    screen.getAllByRole('button').forEach((button) => {
      expect(button).toHaveAttribute('type', 'button')
    })
  })

  it('uses no div elements', () => {
    const { container } = renderFilter()
    expect(container.querySelectorAll('div')).toHaveLength(0)
  })
})

describe('CategoryFilter pressed state', () => {
  it('marks "All" as pressed when no category is active', () => {
    renderFilter({ activeCategory: 'all' })
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Evidence' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('marks only the active category as pressed', () => {
    renderFilter({ activeCategory: 'evidence' })
    expect(screen.getByRole('button', { name: 'Evidence' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Scenes' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows "All" as pressed when the active category is not in the list', () => {
    renderFilter({ activeCategory: 'all', categories: [] })
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('CategoryFilter selection', () => {
  it('calls onSelect with the slug of the clicked category', () => {
    const { onSelect } = renderFilter()
    fireEvent.click(screen.getByRole('button', { name: 'Scenes' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('scenes')
  })

  it('calls onSelect with "all" when "All" is clicked', () => {
    const { onSelect } = renderFilter({ activeCategory: 'evidence' })
    fireEvent.click(screen.getByRole('button', { name: 'All' }))
    expect(onSelect).toHaveBeenCalledWith('all')
  })

  it('activates with the keyboard like any native button (Enter and Space)', () => {
    const { onSelect } = renderFilter()
    const button = screen.getByRole('button', { name: 'Documents' })

    button.focus()
    fireEvent.keyDown(button, { key: 'Enter' })
    fireEvent.click(button)
    fireEvent.keyDown(button, { key: ' ' })
    fireEvent.click(button)

    expect(button).toHaveFocus()
    expect(onSelect).toHaveBeenCalledWith('documents')
  })

  it('does not change its own pressed state; the parent decides via activeCategory', () => {
    const { onSelect, rerender } = renderFilter({ activeCategory: 'all' })
    fireEvent.click(screen.getByRole('button', { name: 'Evidence' }))

    expect(onSelect).toHaveBeenCalledWith('evidence')
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')

    rerender(
      <CategoryFilter categories={CATEGORIES} activeCategory="evidence" onSelect={onSelect} />,
    )
    expect(screen.getByRole('button', { name: 'Evidence' })).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('CategoryFilter layout parity', () => {
  it('keeps one row of a fixed height (the filter-row class from layout.css)', () => {
    const { container } = renderFilter()
    expect(container.querySelector('nav')).toHaveClass('filter-row')
  })
})
