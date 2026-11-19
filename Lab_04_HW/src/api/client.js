export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

async function request(path, { signal } = {}) {
  const response = await fetch(`/api${path}`, { signal, headers: { Accept: 'application/json' } })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const error = body?.error
    throw new ApiError(response.status, error?.code ?? 'INTERNAL_ERROR', error?.message ?? 'Something went wrong.', error?.details)
  }
  return body
}

export function getPhotos({ signal } = {}) {
  return request('/photos', { signal })
}
