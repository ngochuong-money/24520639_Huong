import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDeckKeyboard } from './useDeckKeyboard.js'

function setup(options = {}) {
  const onSwipe = vi.fn()
  const onUndo = vi.fn()
  renderHook(() => useDeckKeyboard({ onSwipe, onUndo, ...options }))
  return { onSwipe, onUndo }
}

const press = (key, init = {}) =>
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }))
  })

afterEach(() => {
  document.body.innerHTML = ''
})

describe('useDeckKeyboard mapping', () => {
  it('ArrowLeft swipes left and ArrowRight swipes right', () => {
    const { onSwipe } = setup()
    press('ArrowLeft')
    press('ArrowRight')
    expect(onSwipe.mock.calls).toEqual([['left'], ['right']])
  })

  it.each(['z', 'Z', 'Backspace'])('%s triggers undo', (key) => {
    const { onUndo } = setup()
    press(key)
    expect(onUndo).toHaveBeenCalledTimes(1)
  })

  it('Backspace is prevented so the browser does not navigate back', () => {
    setup()
    const event = new KeyboardEvent('keydown', { key: 'Backspace', cancelable: true, bubbles: true })
    act(() => {
      window.dispatchEvent(event)
    })
    expect(event.defaultPrevented).toBe(true)
  })

  it('ignores unrelated keys', () => {
    const { onSwipe, onUndo } = setup()
    press('a')
    press('Enter')
    press('ArrowUp')
    expect(onSwipe).not.toHaveBeenCalled()
    expect(onUndo).not.toHaveBeenCalled()
  })

  it('ignores key auto-repeat', () => {
    const { onSwipe } = setup()
    press('ArrowRight', { repeat: true })
    expect(onSwipe).not.toHaveBeenCalled()
  })

  it.each([{ ctrlKey: true }, { metaKey: true }, { altKey: true }])(
    'ignores shortcuts with modifiers %j',
    (modifiers) => {
      const { onSwipe, onUndo } = setup()
      press('z', modifiers)
      press('ArrowLeft', modifiers)
      expect(onUndo).not.toHaveBeenCalled()
      expect(onSwipe).not.toHaveBeenCalled()
    },
  )

  it('does nothing when disabled', () => {
    const { onSwipe, onUndo } = setup({ enabled: false })
    press('ArrowRight')
    press('z')
    expect(onSwipe).not.toHaveBeenCalled()
    expect(onUndo).not.toHaveBeenCalled()
  })

  it('does not steal keys typed into a text field', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    const { onUndo, onSwipe } = setup()
    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', bubbles: true }))
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    })
    expect(onUndo).not.toHaveBeenCalled()
    expect(onSwipe).not.toHaveBeenCalled()
  })

  it('removes its listener on unmount', () => {
    const { onSwipe } = setup()
    const { unmount } = renderHook(() => useDeckKeyboard({ onSwipe, onUndo: vi.fn() }))
    unmount()
    press('ArrowRight')
    expect(onSwipe).toHaveBeenCalledTimes(1)
  })
})

describe('useDeckKeyboard input and lifecycle contract', () => {
  it.each(['textarea', 'select'])('does not steal keys from %s', (tag) => {
    const field = document.createElement(tag)
    document.body.appendChild(field)
    field.focus()
    const { onSwipe, onUndo } = setup()
    act(() => field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true })))
    act(() => field.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })))
    expect(onSwipe).not.toHaveBeenCalled()
    expect(onUndo).not.toHaveBeenCalled()
  })

  it('ignores contentEditable targets', () => {
    const field = document.createElement('section')
    field.setAttribute('contenteditable', 'true')
    // jsdom lacks this browser-computed property.
    Object.defineProperty(field, 'isContentEditable', { value: true })
    document.body.appendChild(field)
    field.focus()
    const { onUndo } = setup()
    act(() => field.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', bubbles: true })))
    expect(onUndo).not.toHaveBeenCalled()
  })

  it('uses the latest callback identities after rerender', () => {
    const first = vi.fn()
    const next = vi.fn()
    const onUndo = vi.fn()
    const { rerender } = renderHook(({ onSwipe }) => useDeckKeyboard({ onSwipe, onUndo }), { initialProps: { onSwipe: first } })
    rerender({ onSwipe: next })
    press('ArrowRight')
    expect(first).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith('right')
  })

  it('cleans up and reattaches once when enabled changes', () => {
    const onSwipe = vi.fn()
    const onUndo = vi.fn()
    const { rerender } = renderHook(({ enabled }) => useDeckKeyboard({ onSwipe, onUndo, enabled }), { initialProps: { enabled: true } })
    press('ArrowRight')
    rerender({ enabled: false })
    press('ArrowRight')
    expect(onSwipe).toHaveBeenCalledTimes(1)
    rerender({ enabled: true })
    press('ArrowRight')
    expect(onSwipe).toHaveBeenCalledTimes(2)
  })
})
