import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/client.js'

const apiMock = vi.hoisted(() => ({
  getCards: vi.fn(),
  getSwipes: vi.fn(),
  createSwipe: vi.fn(),
  undoLastSwipe: vi.fn(),
}))
vi.mock('../../api/client.js', async (importOriginal) => ({
  ...(await importOriginal()),
  ...apiMock,
}))

import { useSwipePersistence } from './useSwipePersistence.js'

const cards = [
  { id: 'a', name: 'Minh Anh', bio: '', imageUrl: '/a.svg' },
  { id: 'b', name: 'Gia Bao', bio: '', imageUrl: '/b.svg' },
]
const deferred = () => {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

beforeEach(() => {
  apiMock.getCards.mockResolvedValue(cards)
  apiMock.getSwipes.mockResolvedValue([])
  apiMock.createSwipe.mockImplementation(async ({ cardId, direction }) => ({
    id: `s-${cardId}`,
    cardId,
    direction,
    createdAt: '2026-11-19T08:30:00.000Z',
  }))
  apiMock.undoLastSwipe.mockResolvedValue({ id: 's' })
})
afterEach(() => {
  vi.clearAllMocks()
})

async function ready() {
  const hook = renderHook(() => useSwipePersistence())
  await waitFor(() => expect(hook.result.current.status).toBe('ready'))
  return hook
}

describe('loading', () => {
  it('starts in loading, then loads cards and history with one shared signal', async () => {
    apiMock.getSwipes.mockResolvedValue([{ cardId: 'a', direction: 'right' }])
    const hook = renderHook(() => useSwipePersistence())
    expect(hook.result.current.status).toBe('loading')
    await waitFor(() => expect(hook.result.current.status).toBe('ready'))

    expect(hook.result.current.history).toEqual([{ cardId: 'a', direction: 'right' }])
    expect(hook.result.current.currentCard).toEqual(cards[1])
    const [cardsSignal] = apiMock.getCards.mock.calls[0]
    const [swipesSignal] = apiMock.getSwipes.mock.calls[0]
    expect(cardsSignal.signal).toBeInstanceOf(AbortSignal)
    expect(cardsSignal.signal).toBe(swipesSignal.signal)
  })

  it('aborts in-flight loads on unmount and reports no error', async () => {
    const pending = deferred()
    apiMock.getCards.mockReturnValue(pending.promise)
    apiMock.getSwipes.mockReturnValue(pending.promise)
    const hook = renderHook(() => useSwipePersistence())
    const { signal } = apiMock.getCards.mock.calls[0][0]

    hook.unmount()

    expect(signal.aborted).toBe(true)
  })

  it('reports a load failure as status "error" with the ApiError', async () => {
    const failure = new ApiError(0, 'NETWORK_ERROR', 'Network request failed.')
    apiMock.getCards.mockRejectedValue(failure)
    const hook = renderHook(() => useSwipePersistence())
    await waitFor(() => expect(hook.result.current.status).toBe('error'))
    expect(hook.result.current.error).toBe(failure)
  })

  it('does not use a didCancel flag (the abort signal is the only cancellation path)', async () => {
    const hook = await ready()
    expect(hook.result.current).not.toHaveProperty('didCancel')
  })
})

describe('swipe persistence', () => {
  it('applies the swipe optimistically and saves it', async () => {
    const hook = await ready()
    await act(async () => {
      await hook.result.current.swipe('right')
    })
    expect(hook.result.current.history).toEqual([{ cardId: 'a', direction: 'right' }])
    expect(apiMock.createSwipe).toHaveBeenCalledWith(
      { cardId: 'a', direction: 'right' },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('blocks a second swipe while the first is still saving (isSyncing)', async () => {
    const pending = deferred()
    apiMock.createSwipe.mockReturnValueOnce(pending.promise)
    const hook = await ready()

    act(() => {
      hook.result.current.swipe('right')
    })
    expect(hook.result.current.isSyncing).toBe(true)
    expect(hook.result.current.canSwipe).toBe(false)

    act(() => {
      hook.result.current.swipe('left')
    })
    expect(hook.result.current.history).toHaveLength(1)
    expect(apiMock.createSwipe).toHaveBeenCalledTimes(1)

    await act(async () => {
      pending.resolve({ id: 's', cardId: 'a', direction: 'right', createdAt: 'x' })
    })
    expect(hook.result.current.isSyncing).toBe(false)
  })

  it('rolls back the optimistic swipe when saving fails and sets the error', async () => {
    const failure = new ApiError(409, 'ALREADY_SWIPED', 'Card has already been swiped.')
    apiMock.createSwipe.mockRejectedValueOnce(failure)
    const hook = await ready()

    await act(async () => {
      await hook.result.current.swipe('left')
    })

    expect(hook.result.current.history).toEqual([])
    expect(hook.result.current.currentCard).toEqual(cards[0])
    expect(hook.result.current.error).toBe(failure)
  })

  it('ignores an AbortError from a save without treating it as a failure', async () => {
    apiMock.createSwipe.mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'))
    const hook = await ready()

    await act(async () => {
      await hook.result.current.swipe('right')
    })

    expect(hook.result.current.error).toBeNull()
  })
})

describe('undo persistence', () => {
  it('removes the entry locally, then calls DELETE /swipes/last', async () => {
    apiMock.getSwipes.mockResolvedValue([{ cardId: 'a', direction: 'right' }])
    const hook = await ready()

    await act(async () => {
      await hook.result.current.undo()
    })

    expect(hook.result.current.history).toEqual([])
    expect(apiMock.undoLastSwipe).toHaveBeenCalledTimes(1)
  })

  it('restores the removed entry with its original direction when the undo request fails', async () => {
    apiMock.getSwipes.mockResolvedValue([{ cardId: 'a', direction: 'left' }])
    apiMock.undoLastSwipe.mockRejectedValueOnce(new ApiError(0, 'NETWORK_ERROR', 'Network request failed.'))
    const hook = await ready()

    await act(async () => {
      await hook.result.current.undo()
    })

    expect(hook.result.current.history).toEqual([{ cardId: 'a', direction: 'left' }])
    expect(hook.result.current.error).toBeInstanceOf(ApiError)
  })

  it('does nothing when there is no history to undo', async () => {
    const hook = await ready()
    await act(async () => {
      await hook.result.current.undo()
    })
    expect(apiMock.undoLastSwipe).not.toHaveBeenCalled()
  })
})

describe('no unhandled rejections', () => {
  it('a failing save never throws out of swipe()', async () => {
    apiMock.createSwipe.mockRejectedValueOnce(new Error('boom'))
    const hook = await ready()
    await expect(
      act(async () => {
        await hook.result.current.swipe('right')
      }),
    ).resolves.not.toThrow()
  })
})


describe('request ordering and cancellation', () => {
  it('locks writes immediately even when two actions run in the same act', async () => {
    const pending = deferred()
    apiMock.createSwipe.mockReturnValueOnce(pending.promise)
    const hook = await ready()
    act(() => {
      void hook.result.current.swipe('right')
      void hook.result.current.swipe('left')
      void hook.result.current.undo()
    })
    expect(apiMock.createSwipe).toHaveBeenCalledTimes(1)
    expect(apiMock.undoLastSwipe).not.toHaveBeenCalled()
    expect(hook.result.current.history).toEqual([{ cardId: 'a', direction: 'right' }])
    await act(async () => pending.resolve({ id: 's' }))
  })

  it('blocks swipe and repeated undo while DELETE is pending, then restores the original entry', async () => {
    apiMock.getSwipes.mockResolvedValue([{ cardId: 'a', direction: 'left' }, { cardId: 'b', direction: 'right' }])
    const pending = deferred()
    apiMock.undoLastSwipe.mockReturnValueOnce(pending.promise)
    const hook = await ready()
    act(() => {
      void hook.result.current.undo()
      void hook.result.current.undo()
      void hook.result.current.swipe('left')
    })
    expect(apiMock.undoLastSwipe).toHaveBeenCalledTimes(1)
    expect(apiMock.createSwipe).not.toHaveBeenCalled()
    expect(hook.result.current.score).toBe(-5)
    await act(async () => pending.reject(new ApiError(0, 'NETWORK_ERROR', 'Network request failed.')))
    expect(hook.result.current.history).toEqual([{ cardId: 'a', direction: 'left' }, { cardId: 'b', direction: 'right' }])
    expect(hook.result.current.score).toBe(5)
    expect(hook.result.current.isSyncing).toBe(false)
  })

  it('aborts an in-flight write on unmount without leaking a rejection', async () => {
    apiMock.createSwipe.mockImplementationOnce((_, { signal }) => new Promise((_, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
    }))
    const hook = await ready()
    let saving
    act(() => { saving = hook.result.current.swipe('right') })
    const { signal } = apiMock.createSwipe.mock.calls[0][1]
    hook.unmount()
    expect(signal.aborted).toBe(true)
    await act(async () => { await expect(saving).resolves.toBeUndefined() })
  })

  it('ignores a load AbortError and does not mark loading as an error', async () => {
    apiMock.getCards.mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'))
    const hook = renderHook(() => useSwipePersistence())
    await act(async () => { await Promise.resolve() })
    expect(hook.result.current.status).toBe('loading')
    expect(hook.result.current.error).toBeNull()
  })

  it('rejects an invalid direction without dispatching or sending a write', async () => {
    const hook = await ready()
    await act(async () => { await hook.result.current.swipe('up') })
    expect(hook.result.current.history).toEqual([])
    expect(apiMock.createSwipe).not.toHaveBeenCalled()
  })

  it('clears a previous error after a successful retry', async () => {
    apiMock.createSwipe.mockRejectedValueOnce(new ApiError(0, 'NETWORK_ERROR', 'Network request failed.'))
    const hook = await ready()
    await act(async () => { await hook.result.current.swipe('left') })
    expect(hook.result.current.error).toBeInstanceOf(ApiError)
    await act(async () => { await hook.result.current.swipe('right') })
    expect(hook.result.current.error).toBeNull()
    expect(hook.result.current.score).toBe(10)
  })
})
