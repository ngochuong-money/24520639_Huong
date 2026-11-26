import { validateSwipeInput } from '../../shared/validation.js'

const BASE = '/api'

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

const GENERIC_MESSAGE = 'Something went wrong.'

// One place for every request: base path, JSON headers, signal, and error mapping.
// AbortError is rethrown untouched so callers can ignore it.
async function request(path, { method = 'GET', body, signal } = {}) {
  let response
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      signal,
      headers: body === undefined ? { Accept: 'application/json' } : {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw error
    }
    throw new ApiError(0, 'NETWORK_ERROR', 'Network request failed. Check your connection.')
  }

  let payload
  try {
    payload = await response.json()
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw error
    }
    throw new ApiError(response.status, 'INTERNAL_ERROR', GENERIC_MESSAGE)
  }

  if (!response.ok) {
    const error = payload?.error
    if (error && typeof error.code === 'string') {
      throw new ApiError(response.status, error.code, error.message ?? GENERIC_MESSAGE, error.details)
    }
    throw new ApiError(response.status, 'INTERNAL_ERROR', GENERIC_MESSAGE)
  }

  return payload
}

export function getCards({ signal } = {}) {
  return request('/cards', { signal })
}

export function getPhotos({ category, signal } = {}) {
  const query = category === undefined ? '' : `?category=${encodeURIComponent(category)}`
  return request(`/photos${query}`, { signal })
}

export function getSwipes({ signal } = {}) {
  return request('/swipes', { signal })
}

export function createSwipe({ cardId, direction }, { signal } = {}) {
  const details = validateSwipeInput({ cardId, direction })
  if (details.length > 0) {
    // Programming error guard; the server remains the authority. Status 0 = never sent.
    return Promise.reject(new ApiError(0, 'VALIDATION_ERROR', 'Request validation failed.', details))
  }
  return request('/swipes', { method: 'POST', body: { cardId, direction }, signal })
}

export function undoLastSwipe({ signal } = {}) {
  return request('/swipes/last', { method: 'DELETE', signal })
}
