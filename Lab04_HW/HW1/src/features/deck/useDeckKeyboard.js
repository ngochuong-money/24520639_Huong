import { useEffect, useRef } from 'react'

const TEXT_INPUT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

function isEditableTarget(target) {
  return target instanceof HTMLElement && (TEXT_INPUT_TAGS.has(target.tagName) || target.isContentEditable)
}

export function useDeckKeyboard({ onSwipe, onUndo, enabled = true }) {
  // Latest callbacks in a ref, so the listener is attached once per enabled state
  // and never re-attached when the parent passes new function identities.
  const handlersRef = useRef({ onSwipe, onUndo })
  useEffect(() => {
    handlersRef.current = { onSwipe, onUndo }
  }, [onSwipe, onUndo])

  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    function handleKeyDown(event) {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) {
        return
      }
      if (isEditableTarget(event.target)) {
        return
      }

      const { onSwipe: swipe, onUndo: undo } = handlersRef.current
      if (event.key === 'ArrowLeft') {
        swipe('left')
      } else if (event.key === 'ArrowRight') {
        swipe('right')
      } else if (event.key === 'z' || event.key === 'Z') {
        undo()
      } else if (event.key === 'Backspace') {
        event.preventDefault()
        undo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled])
}
