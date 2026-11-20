import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, createSwipe, getCards, getSwipes, undoLastSwipe } from '../../api/client.js'
import { isValidDirection } from '../../../shared/validation.js'
import { useSwipeDeck } from './useSwipeDeck.js'

const isAbort = (error) => error?.name === 'AbortError'
const asApiError = (failure) => failure instanceof ApiError
  ? failure
  : new ApiError(0, 'INTERNAL_ERROR', 'Something went wrong.')

export function useSwipePersistence() {
  const deck = useSwipeDeck()
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)
  const deckRef = useRef(deck)
  const controllerRef = useRef(null)
  // One operation at a time: this also holds the exact entry needed for rollback.
  const operationRef = useRef(null)

  useEffect(() => {
    deckRef.current = deck
  })

  useEffect(() => {
    const controller = new AbortController()
    controllerRef.current = controller
    const { signal } = controller

    Promise.all([getCards({ signal }), getSwipes({ signal })])
      .then(([cards, history]) => {
        if (signal.aborted) return
        deckRef.current.hydrate(cards, history)
        setStatus('ready')
      })
      .catch((failure) => {
        if (signal.aborted || isAbort(failure)) return
        setError(asApiError(failure))
        setStatus('error')
      })

    return () => controller.abort()
  }, [])

  const swipe = useCallback(async (direction) => {
    const current = deckRef.current
    const signal = controllerRef.current?.signal
    if (!current.currentCard || operationRef.current || status !== 'ready' ||
        !signal || signal.aborted || !isValidDirection(direction)) return

    operationRef.current = { cardId: current.currentCard.id, direction }
    const entry = operationRef.current
    current.swipe(direction)
    setPendingCount((count) => count + 1)
    try {
      await createSwipe(entry, { signal })
      if (!signal.aborted) setError(null)
    } catch (failure) {
      if (signal.aborted || isAbort(failure)) return
      deckRef.current.undo()
      setError(asApiError(failure))
    } finally {
      operationRef.current = null
      if (!signal.aborted) setPendingCount((count) => count - 1)
    }
  }, [status])

  const undo = useCallback(async () => {
    const current = deckRef.current
    const signal = controllerRef.current?.signal
    const last = current.history[current.history.length - 1]
    if (!last || operationRef.current || status !== 'ready' || !signal || signal.aborted) return

    operationRef.current = { ...last }
    const entry = operationRef.current
    current.undo()
    setPendingCount((count) => count + 1)
    try {
      await undoLastSwipe({ signal })
      if (!signal.aborted) setError(null)
    } catch (failure) {
      if (signal.aborted || isAbort(failure)) return
      deckRef.current.swipe(entry.direction)
      setError(asApiError(failure))
    } finally {
      operationRef.current = null
      if (!signal.aborted) setPendingCount((count) => count - 1)
    }
  }, [status])

  const isSyncing = pendingCount > 0
  return {
    ...deck,
    swipe,
    undo,
    status,
    error,
    isSyncing,
    canSwipe: deck.currentCard !== null && !isSyncing && status === 'ready',
  }
}
