import process from 'node:process'
import { setImmediate } from 'node:timers'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/client.js'
import { useSwipePersistence } from './useSwipePersistence.js'

const CARD_A = { id: '64f1a2b3c4d5e6f7a8b9c0d1', name: 'Minh Anh', bio: '', imageUrl: '/a.svg' }
const CARD_B = { id: '64f1a2b3c4d5e6f7a8b9c0d2', name: 'Gia Bao', bio: '', imageUrl: '/b.svg' }
const CARDS = [CARD_A, CARD_B]

function jsonResponse(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function deferredResponse() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

// Route fetch by method and path. Each route can be replaced per test.
let routes
let fetchMock
beforeEach(() => {
  routes = {
    'GET /api/cards': () => jsonResponse(200, CARDS),
    'GET /api/swipes': () => jsonResponse(200, []),
    'POST /api/swipes': (init) => {
      const body = JSON.parse(init.body)
      return jsonResponse(201, { id: 'new', ...body, createdAt: '2026-11-19T08:30:00.000Z' })
    },
    'DELETE /api/swipes/last': () => jsonResponse(200, { id: 'gone' }),
  }
  fetchMock = vi.fn((url, init = {}) => {
    const key = `${init.method ?? 'GET'} ${url}`
    const handler = routes[key]
    if (!handler) {
      return Promise.resolve(jsonResponse(404, { error: { code: 'ROUTE_NOT_FOUND', message: 'Route not found.' } }))
    }
    return Promise.resolve().then(() => handler(init))
  })
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const ready = async () => {
  const hook = renderHook(() => useSwipePersistence())
  await waitFor(() => expect(hook.result.current.status).toBe('ready'))
  return hook
}

describe('loading goes through fetch with a shared, abortable signal', () => {
  it('sends both GET requests with the same signal', async () => {
    await ready()
    const [cardsUrl, cardsInit] = fetchMock.mock.calls.find(([url]) => url === '/api/cards')
    const [swipesUrl, swipesInit] = fetchMock.mock.calls.find(([url]) => url === '/api/swipes')
    expect(cardsUrl).toBe('/api/cards')
    expect(swipesUrl).toBe('/api/swipes')
    expect(cardsInit.signal).toBeInstanceOf(AbortSignal)
    expect(cardsInit.signal).toBe(swipesInit.signal)
  })

  it('aborts the in-flight GET requests on unmount and reports no error', async () => {
    const pending = deferredResponse()
    routes['GET /api/cards'] = () => pending.promise
    const hook = renderHook(() => useSwipePersistence())
    const [, init] = fetchMock.mock.calls.find(([url]) => url === '/api/cards')

    hook.unmount()
    await act(async () => {
      pending.reject(new DOMException('Aborted', 'AbortError'))
    })

    expect(init.signal.aborted).toBe(true)
    expect(hook.result.current.error).toBeNull()
  })
})

describe('POST abort and rollback through real fetch', () => {
  it('aborts a pending POST on unmount without an error or a state update', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const pending = deferredResponse()
    routes['POST /api/swipes'] = () => pending.promise
    const hook = await ready()

    let saving
    act(() => {
      saving = hook.result.current.swipe('right')
    })
    const postCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')
    hook.unmount()

    expect(postCall[1].signal.aborted).toBe(true)
    await act(async () => {
      pending.reject(new DOMException('Aborted', 'AbortError'))
      await expect(saving).resolves.toBeUndefined()
    })
    expect(hook.result.current.error).toBeNull()
    expect(consoleError).not.toHaveBeenCalled()
  })

  it('rolls back and exposes an ApiError when the server returns a contract error', async () => {
    routes['POST /api/swipes'] = () =>
      jsonResponse(409, { error: { code: 'ALREADY_SWIPED', message: 'Card has already been swiped.' } })
    const hook = await ready()

    await act(async () => {
      await hook.result.current.swipe('left')
    })

    expect(hook.result.current.history).toEqual([])
    expect(hook.result.current.currentCard).toEqual(CARD_A)
    expect(hook.result.current.error).toBeInstanceOf(ApiError)
    expect(hook.result.current.error.code).toBe('ALREADY_SWIPED')
  })

  it('rolls back on a network failure (fetch rejects) with NETWORK_ERROR', async () => {
    routes['POST /api/swipes'] = () => {
      throw new TypeError('Failed to fetch')
    }
    const hook = await ready()

    await act(async () => {
      await hook.result.current.swipe('right')
    })

    expect(hook.result.current.history).toEqual([])
    expect(hook.result.current.error.code).toBe('NETWORK_ERROR')
  })

  it('rolls back on a non-JSON 502 page without leaking the body', async () => {
    routes['POST /api/swipes'] = () => new Response('<html>secret</html>', { status: 502 })
    const hook = await ready()

    await act(async () => {
      await hook.result.current.swipe('right')
    })

    expect(hook.result.current.history).toEqual([])
    expect(hook.result.current.error.code).toBe('INTERNAL_ERROR')
    expect(JSON.stringify(hook.result.current.error)).not.toContain('secret')
  })
})

describe('DELETE abort and rollback through real fetch', () => {
  it('aborts a pending undo on unmount', async () => {
    const pending = deferredResponse()
    routes['DELETE /api/swipes/last'] = () => pending.promise
    routes['GET /api/swipes'] = () => jsonResponse(200, [{ cardId: CARD_A.id, direction: 'right' }])
    const hook = await ready()

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    let removing
    act(() => {
      removing = hook.result.current.undo()
    })
    const deleteCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'DELETE')
    hook.unmount()

    expect(deleteCall[1].signal.aborted).toBe(true)
    await act(async () => {
      pending.reject(new DOMException('Aborted', 'AbortError'))
      await expect(removing).resolves.toBeUndefined()
    })
    expect(hook.result.current.error).toBeNull()
    expect(consoleError).not.toHaveBeenCalled()
  })

  it('restores the removed entry when the DELETE fails', async () => {
    routes['GET /api/swipes'] = () => jsonResponse(200, [{ cardId: CARD_A.id, direction: 'left' }])
    routes['DELETE /api/swipes/last'] = () => jsonResponse(500, { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } })
    const hook = await ready()

    await act(async () => {
      await hook.result.current.undo()
    })

    expect(hook.result.current.history).toEqual([{ cardId: CARD_A.id, direction: 'left' }])
    expect(hook.result.current.error.code).toBe('INTERNAL_ERROR')
  })
})

describe('no unhandled rejections or stray logs', () => {
  it('a failing request never produces an unhandled rejection', async () => {
    const unhandled = vi.fn()
    process.on('unhandledRejection', unhandled)
    try {
      routes['POST /api/swipes'] = () => {
        throw new TypeError('Failed to fetch')
      }
      const hook = await ready()
      await act(async () => {
        await hook.result.current.swipe('right')
      })
      await new Promise((resolve) => setImmediate(resolve))
      expect(unhandled).not.toHaveBeenCalled()
    } finally {
      process.off('unhandledRejection', unhandled)
    }
  })

  it('a normal load and swipe log nothing to the console', async () => {
    const spies = ['log', 'warn', 'error'].map((m) => vi.spyOn(console, m).mockImplementation(() => {}))
    const hook = await ready()
    await act(async () => {
      await hook.result.current.swipe('right')
    })
    spies.forEach((spy) => expect(spy).not.toHaveBeenCalled())
  })
})


describe('AbortError mapping independently of lifecycle cancellation', () => {
  it('ignores a fetch AbortError while the hook signal is still active', async () => {
    routes['POST /api/swipes'] = () => Promise.reject(new DOMException('Aborted', 'AbortError'))
    const hook = await ready()
    await act(async () => { await hook.result.current.swipe('right') })
    const postCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')
    expect(postCall[1].signal.aborted).toBe(false)
    expect(hook.result.current.error).toBeNull()
    expect(hook.result.current.isSyncing).toBe(false)
  })
})
