import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../errors.js'
import { errorHandler } from './errorHandler.js'

function createRes() {
  return { headersSent: false, status: vi.fn().mockReturnThis(), json: vi.fn() }
}

describe('errorHandler', () => {
  it('maps ApiError to its status and the contract error shape', () => {
    const res = createRes()
    errorHandler(new ApiError(404, 'CARD_NOT_FOUND', 'Card not found.'), {}, res, vi.fn())
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'CARD_NOT_FOUND', message: 'Card not found.' },
    })
  })

  it('includes details only when provided', () => {
    const res = createRes()
    const details = [{ field: 'direction', message: 'Must be "left" or "right".' }]
    errorHandler(new ApiError(400, 'VALIDATION_ERROR', 'Request validation failed.', details), {}, res, vi.fn())
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'VALIDATION_ERROR', message: 'Request validation failed.', details },
    })
  })

  it('hides internal error details behind a generic 500', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = createRes()
    errorHandler(new Error('cannot connect to mongodb://user:secret@host'), {}, res, vi.fn())
    expect(res.status).toHaveBeenCalledWith(500)
    const body = res.json.mock.calls[0][0]
    expect(body).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } })
    expect(JSON.stringify(body)).not.toContain('secret')
    consoleError.mockRestore()
  })
})
