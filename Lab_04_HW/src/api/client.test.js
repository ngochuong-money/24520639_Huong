import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, createSwipe, getCards, getPhotos, getSwipes, undoLastSwipe } from './client.js'
import { VALID_ID } from '../../shared/validation.cases.js'

function jsonResponse(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

let fetchMock
beforeEach(() => {
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('request basics', () => {
  it('calls /api with the given path and passes the abort signal', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, []))
    const controller = new AbortController()

    await getCards({ signal: controller.signal })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/cards',
      expect.objectContaining({ signal: controller.signal }),
    )
  })

  it('sends Accept: application/json', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, []))
    await getSwipes()
    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers.Accept).toBe('application/json')
  })

  it('appends the category query for getPhotos only when given', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(200, [])))
    await getPhotos()
    await getPhotos({ category: 'evidence' })
    expect(fetchMock.mock.calls[0][0]).toBe('/api/photos')
    expect(fetchMock.mock.calls[1][0]).toBe('/api/photos?category=evidence')
  })

  it('returns parsed JSON on success', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, [{ id: VALID_ID }]))
    await expect(getCards()).resolves.toEqual([{ id: VALID_ID }])
  })
})

describe('createSwipe', () => {
  it('POSTs a JSON body with the swipe fields', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { id: VALID_ID }))
    await createSwipe({ cardId: VALID_ID, direction: 'right' })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/swipes')
    expect(init.method).toBe('POST')
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(JSON.parse(init.body)).toEqual({ cardId: VALID_ID, direction: 'right' })
  })

  it('rejects invalid input before sending (client-side parity check)', async () => {
    await expect(createSwipe({ cardId: 'bad', direction: 'up' })).rejects.toMatchObject({
      status: 0,
      code: 'VALIDATION_ERROR',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('forwards the signal to fetch', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, {}))
    const controller = new AbortController()
    await createSwipe({ cardId: VALID_ID, direction: 'left' }, { signal: controller.signal })
    expect(fetchMock.mock.calls[0][1].signal).toBe(controller.signal)
  })
})

describe('undoLastSwipe', () => {
  it('sends DELETE /api/swipes/last and returns the removed swipe', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { id: VALID_ID }))
    await expect(undoLastSwipe()).resolves.toEqual({ id: VALID_ID })
    expect(fetchMock.mock.calls[0][0]).toBe('/api/swipes/last')
    expect(fetchMock.mock.calls[0][1].method).toBe('DELETE')
  })
})

describe('error mapping', () => {
  it('maps the contract error shape to ApiError', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(409, {
        error: { code: 'ALREADY_SWIPED', message: 'Card has already been swiped.' },
      }),
    )
    const error = await createSwipe({ cardId: VALID_ID, direction: 'left' }).catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 409,
      code: 'ALREADY_SWIPED',
      message: 'Card has already been swiped.',
    })
  })

  it('keeps validation details', async () => {
    const details = [{ field: 'direction', message: 'Must be "left" or "right".' }]
    fetchMock.mockResolvedValue(
      jsonResponse(400, { error: { code: 'VALIDATION_ERROR', message: 'Request validation failed.', details } }),
    )
    const error = await getPhotos({ category: 'x' }).catch((e) => e)
    expect(error.details).toEqual(details)
  })

  it('maps a non-JSON error body to a generic ApiError without leaking it', async () => {
    fetchMock.mockResolvedValue(new Response('<html>secret stack</html>', { status: 502 }))
    const error = await getCards().catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(502)
    expect(error.code).toBe('INTERNAL_ERROR')
    expect(error.message).toBe('Something went wrong.')
    expect(JSON.stringify(error)).not.toContain('secret')
  })

  it('maps a network failure to NETWORK_ERROR', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    const error = await getCards().catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.code).toBe('NETWORK_ERROR')
    expect(error.status).toBe(0)
  })

  it('lets AbortError through unchanged so callers can ignore it', async () => {
    const abort = new DOMException('Aborted', 'AbortError')
    fetchMock.mockRejectedValue(abort)
    const error = await getCards().catch((e) => e)
    expect(error).toBe(abort)
    expect(error).not.toBeInstanceOf(ApiError)
  })

  it('never logs to the console', async () => {
    const spies = ['log', 'error', 'warn'].map((m) => vi.spyOn(console, m).mockImplementation(() => {}))
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    await getCards().catch(() => {})
    spies.forEach((spy) => expect(spy).not.toHaveBeenCalled())
    spies.forEach((spy) => spy.mockRestore())
  })
})


describe('response parsing failures', () => {
  it('preserves AbortError while reading the response body', async () => {
    const abort = new DOMException('Aborted', 'AbortError')
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: () => Promise.reject(abort) })
    await expect(getCards()).rejects.toBe(abort)
  })

  it('wraps malformed successful JSON without exposing the raw body', async () => {
    fetchMock.mockResolvedValue(new Response('<html>secret stack</html>', { status: 200 }))
    await expect(getCards()).rejects.toMatchObject({
      name: 'ApiError', status: 200, code: 'INTERNAL_ERROR', message: 'Something went wrong.',
    })
  })
})
