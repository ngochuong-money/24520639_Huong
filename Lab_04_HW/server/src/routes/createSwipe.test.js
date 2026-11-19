import request from 'supertest'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { VALID_ID, swipeInputCases } from '../../../shared/validation.cases.js'
import { createApp } from '../app.js'
import Card from '../models/Card.js'
import Swipe from '../models/Swipe.js'

const ID_PATTERN = /^[0-9a-f]{24}$/
const CREATED_AT = '2026-11-19T08:30:00.000Z'

const invalidCases = swipeInputCases.filter(({ errors }) => errors.length > 0)
const validCases = swipeInputCases.filter(({ errors }) => errors.length === 0)

const query = (value) => ({ exec: async () => value })

function mockDatabase({ cardExists = true, alreadySwiped = false } = {}) {
  return {
    cardExists: vi
      .spyOn(Card, 'exists')
      .mockReturnValue(query(cardExists ? { _id: VALID_ID } : null)),
    swipeExists: vi
      .spyOn(Swipe, 'exists')
      .mockReturnValue(query(alreadySwiped ? { _id: VALID_ID } : null)),
    create: vi
      .spyOn(Swipe, 'create')
      .mockImplementation(async (doc) => new Swipe({ ...doc, createdAt: new Date(CREATED_AT) })),
  }
}

const post = (body) => request(createApp()).post('/api/swipes').send(body)

afterEach(() => {
  vi.restoreAllMocks()
})

describe('POST /api/swipes: success', () => {
  it.each(['left', 'right'])('creates a %s swipe and returns 201 in the contract shape', async (direction) => {
    const db = mockDatabase()

    const res = await post({ cardId: VALID_ID, direction })

    expect(res.status).toBe(201)
    expect(res.body).toEqual({
      id: expect.stringMatching(ID_PATTERN),
      cardId: VALID_ID,
      direction,
      createdAt: CREATED_AT,
    })
    expect(res.body).not.toHaveProperty('_id')
    expect(res.body).not.toHaveProperty('__v')
    expect(db.cardExists).toHaveBeenCalledWith({ _id: VALID_ID })
    expect(db.swipeExists).toHaveBeenCalledWith({ cardId: VALID_ID })
    expect(db.create).toHaveBeenCalledWith({ cardId: VALID_ID, direction })
  })

  it('ignores extra fields and never persists them', async () => {
    const db = mockDatabase()

    const res = await post({
      cardId: VALID_ID,
      direction: 'left',
      id: 'client-chosen',
      createdAt: '2000-01-01T00:00:00.000Z',
      extra: true,
    })

    expect(res.status).toBe(201)
    expect(db.create).toHaveBeenCalledWith({ cardId: VALID_ID, direction: 'left' })
    expect(res.body.createdAt).toBe(CREATED_AT)
  })

  it.each(validCases)('accepts the shared valid case: $name', async ({ input }) => {
    mockDatabase()
    const res = await post(input)
    expect(res.status).toBe(201)
  })
})

describe('POST /api/swipes: validation (parity with shared/validation.js)', () => {
  it.each(invalidCases)('returns 400 VALIDATION_ERROR: $name', async ({ input, errors }) => {
    const db = mockDatabase()

    const res = await post(input)

    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: { code: 'VALIDATION_ERROR', message: 'Request validation failed.', details: errors },
    })
    expect(db.cardExists).not.toHaveBeenCalled()
    expect(db.swipeExists).not.toHaveBeenCalled()
    expect(db.create).not.toHaveBeenCalled()
  })

  it('returns 400 VALIDATION_ERROR when there is no body at all', async () => {
    const db = mockDatabase()
    const res = await request(createApp()).post('/api/swipes')
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(db.create).not.toHaveBeenCalled()
  })

  it('returns 400 VALIDATION_ERROR when the body is not JSON', async () => {
    const db = mockDatabase()
    const res = await request(createApp())
      .post('/api/swipes')
      .set('Content-Type', 'text/plain')
      .send(`cardId=${VALID_ID}&direction=left`)
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(db.create).not.toHaveBeenCalled()
  })

  it.each(['null', '"text"', '5', 'true'])('returns 400 INVALID_JSON for the JSON primitive %s', async (raw) => {
    const db = mockDatabase()
    const res = await request(createApp())
      .post('/api/swipes')
      .set('Content-Type', 'application/json')
      .send(raw)
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('INVALID_JSON')
    expect(db.create).not.toHaveBeenCalled()
  })
})

describe('POST /api/swipes: business rules', () => {
  it('returns 404 CARD_NOT_FOUND before checking the history', async () => {
    const db = mockDatabase({ cardExists: false, alreadySwiped: true })

    const res = await post({ cardId: VALID_ID, direction: 'right' })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: { code: 'CARD_NOT_FOUND', message: 'Card not found.' } })
    expect(db.swipeExists).not.toHaveBeenCalled()
    expect(db.create).not.toHaveBeenCalled()
  })

  it('returns 409 ALREADY_SWIPED when the card is already in the history', async () => {
    const db = mockDatabase({ alreadySwiped: true })

    const res = await post({ cardId: VALID_ID, direction: 'right' })

    expect(res.status).toBe(409)
    expect(res.body).toEqual({
      error: { code: 'ALREADY_SWIPED', message: 'Card has already been swiped.' },
    })
    expect(db.create).not.toHaveBeenCalled()
  })

  it('maps a duplicate-key race (E11000) to 409 ALREADY_SWIPED without leaking details', async () => {
    const db = mockDatabase()
    db.create.mockRejectedValue(
      Object.assign(new Error('E11000 duplicate key mongodb://user:secret@host'), { code: 11000 }),
    )

    const res = await post({ cardId: VALID_ID, direction: 'left' })

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('ALREADY_SWIPED')
    expect(JSON.stringify(res.body)).not.toContain('secret')
  })
})

describe('POST /api/swipes: database failures', () => {
  it('returns a generic 500 when a query fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockDatabase()
    Card.exists.mockReturnValue({
      exec: async () => {
        throw new Error('connect failed mongodb://user:secret@host')
      },
    })

    const res = await post({ cardId: VALID_ID, direction: 'left' })

    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } })
    expect(JSON.stringify(res.body)).not.toContain('secret')
    consoleError.mockRestore()
  })

  it('returns a generic 500 when saving fails for any other reason', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const db = mockDatabase()
    db.create.mockRejectedValue(new Error('disk full'))

    const res = await post({ cardId: VALID_ID, direction: 'left' })

    expect(res.status).toBe(500)
    expect(res.body.error.code).toBe('INTERNAL_ERROR')
    consoleError.mockRestore()
  })
})
