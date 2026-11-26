import request from 'supertest'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { VALID_ID } from '../../../shared/validation.cases.js'
import { createApp } from '../app.js'
import Swipe from '../models/Swipe.js'

const ID_PATTERN = /^[0-9a-f]{24}$/
const CREATED_AT = '2026-11-19T08:30:00.000Z'

const query = (value) => ({ exec: async () => value })
const makeSwipe = (overrides = {}) =>
  new Swipe({ cardId: VALID_ID, direction: 'right', createdAt: new Date(CREATED_AT), ...overrides })

function mockDelete(result) {
  return vi.spyOn(Swipe, 'findOneAndDelete').mockReturnValue(query(result))
}

const undo = () => request(createApp()).delete('/api/swipes/last')
const negate = (sort) => Object.fromEntries(Object.entries(sort).map(([key, value]) => [key, -value]))

afterEach(() => {
  vi.restoreAllMocks()
})

describe('DELETE /api/swipes/last: success', () => {
  it('removes the newest swipe and returns it in the contract shape', async () => {
    const remove = mockDelete(makeSwipe())

    const res = await undo()

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      id: expect.stringMatching(ID_PATTERN),
      cardId: VALID_ID,
      direction: 'right',
      createdAt: CREATED_AT,
    })
    expect(res.body).not.toHaveProperty('_id')
    expect(res.body).not.toHaveProperty('__v')
    expect(remove).toHaveBeenCalledTimes(1)
    expect(remove).toHaveBeenCalledWith({}, { sort: { createdAt: -1, _id: -1 } })
  })

  it('ignores any request body', async () => {
    const remove = mockDelete(makeSwipe())

    const res = await request(createApp())
      .delete('/api/swipes/last')
      .send({ cardId: '000000000000000000000000', direction: 'left' })

    expect(res.status).toBe(200)
    expect(remove).toHaveBeenCalledWith({}, expect.any(Object))
  })

  it('uses the sort order that the swipe index supports (LIFO at the persistence layer)', async () => {
    const remove = mockDelete(makeSwipe())

    await undo()

    const [, options] = remove.mock.calls[0]
    expect(Swipe.schema.indexes().map(([keys]) => keys)).toContainEqual(options.sort)
  })

  it('removes exactly the swipe that GET /api/swipes lists last (opposite sort order)', async () => {
    const sort = vi.fn().mockReturnValue({ exec: async () => [] })
    vi.spyOn(Swipe, 'find').mockReturnValue({ sort })
    const remove = mockDelete(makeSwipe())

    await request(createApp()).get('/api/swipes')
    await undo()

    expect(remove.mock.calls[0][1].sort).toEqual(negate(sort.mock.calls[0][0]))
  })
})

describe('DELETE /api/swipes/last: empty history', () => {
  it('returns 404 HISTORY_EMPTY in the contract error shape', async () => {
    mockDelete(null)

    const res = await undo()

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: { code: 'HISTORY_EMPTY', message: 'No swipe to undo.' } })
  })

  it('answers 200 for the last swipe, then 404 for the next undo', async () => {
    const remove = vi
      .spyOn(Swipe, 'findOneAndDelete')
      .mockReturnValueOnce(query(makeSwipe()))
      .mockReturnValueOnce(query(null))

    const first = await undo()
    const second = await undo()

    expect(first.status).toBe(200)
    expect(second.status).toBe(404)
    expect(second.body.error.code).toBe('HISTORY_EMPTY')
    expect(remove).toHaveBeenCalledTimes(2)
  })
})

describe('DELETE: routes the contract does not define', () => {
  it.each(['/api/swipes', '/api/swipes/abc', `/api/swipes/${VALID_ID}`])(
    'DELETE %s returns 404 ROUTE_NOT_FOUND and deletes nothing',
    async (url) => {
      const remove = vi.spyOn(Swipe, 'findOneAndDelete')

      const res = await request(createApp()).delete(url)

      expect(res.status).toBe(404)
      expect(res.body.error.code).toBe('ROUTE_NOT_FOUND')
      expect(remove).not.toHaveBeenCalled()
    },
  )
})

describe('DELETE /api/swipes/last: database failures', () => {
  it('returns a generic 500 without leaking details', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(Swipe, 'findOneAndDelete').mockReturnValue({
      exec: async () => {
        throw new Error('connect failed mongodb://user:secret@host')
      },
    })

    const res = await undo()

    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } })
    expect(JSON.stringify(res.body)).not.toContain('secret')
    consoleError.mockRestore()
  })
})
