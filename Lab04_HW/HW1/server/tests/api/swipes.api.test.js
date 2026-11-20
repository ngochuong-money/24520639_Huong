import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { swipeInputCases } from '../../../shared/validation.cases.js'
import { createApp } from '../../src/app.js'
import Swipe from '../../src/models/Swipe.js'
import { seedFixtures } from './fixtures.js'

const app = createApp()
const ID_PATTERN = /^[0-9a-f]{24}$/
const MISSING_CARD_ID = '000000000000000000000000'
const invalidCases = swipeInputCases.filter(({ errors }) => errors.length > 0)

const post = (body) => request(app).post('/api/swipes').send(body)
const list = () => request(app).get('/api/swipes')
const undo = () => request(app).delete('/api/swipes/last')
const countSwipes = () => Swipe.countDocuments({}).exec()
const sortedStatuses = (responses) => responses.map((res) => res.status).sort((a, b) => a - b)

async function swipeInOrder(entries) {
  const created = []
  for (const [cardId, direction] of entries) {
    const res = await post({ cardId, direction })
    expect(res.status).toBe(201)
    created.push(res.body)
  }
  return created
}

describe('GET /api/swipes', () => {
  it('returns an empty array when nothing was swiped', async () => {
    const res = await list()
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

describe('POST /api/swipes: success', () => {
  it.each(['left', 'right'])('creates a %s swipe (201) and persists it', async (direction) => {
    const { cardIds } = await seedFixtures()
    const before = Date.now()

    const res = await post({ cardId: cardIds[0], direction })

    expect(res.status).toBe(201)
    expect(res.body).toEqual({
      id: expect.stringMatching(ID_PATTERN),
      cardId: cardIds[0],
      direction,
      createdAt: expect.any(String),
    })
    expect(new Date(res.body.createdAt).toISOString()).toBe(res.body.createdAt)
    expect(Date.parse(res.body.createdAt)).toBeGreaterThanOrEqual(before)
    expect(await countSwipes()).toBe(1)
    expect((await list()).body).toEqual([res.body])
  })

  it('ignores extra fields and sets id and createdAt on the server', async () => {
    const { cardIds } = await seedFixtures()

    const res = await post({
      cardId: cardIds[0],
      direction: 'left',
      id: 'client-chosen',
      createdAt: '2000-01-01T00:00:00.000Z',
      extra: true,
    })

    expect(res.status).toBe(201)
    expect(Object.keys(res.body).sort()).toEqual(['cardId', 'createdAt', 'direction', 'id'])
    expect(res.body.id).toMatch(ID_PATTERN)
    expect(res.body.createdAt).not.toBe('2000-01-01T00:00:00.000Z')
  })
})

describe('POST /api/swipes: bad payloads (parity with shared/validation.js)', () => {
  it.each(invalidCases)('400 VALIDATION_ERROR: $name', async ({ input, errors }) => {
    await seedFixtures()

    const res = await post(input)

    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: { code: 'VALIDATION_ERROR', message: 'Request validation failed.', details: errors },
    })
    expect(await countSwipes()).toBe(0)
  })

  it('400 VALIDATION_ERROR when there is no body at all', async () => {
    await seedFixtures()
    const res = await request(app).post('/api/swipes')
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(res.body.error.details).toEqual([
      { field: 'body', message: 'Body must be a JSON object.' },
    ])
  })

  it('400 VALIDATION_ERROR when the body is not JSON', async () => {
    const { cardIds } = await seedFixtures()
    const res = await request(app)
      .post('/api/swipes')
      .set('Content-Type', 'text/plain')
      .send(`cardId=${cardIds[0]}&direction=left`)
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(await countSwipes()).toBe(0)
  })

  it('400 INVALID_JSON for malformed JSON', async () => {
    const res = await request(app)
      .post('/api/swipes')
      .set('Content-Type', 'application/json')
      .send('{bad')
    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' },
    })
  })

  it.each(['null', '"text"', '5', 'true'])('400 INVALID_JSON for the JSON primitive %s', async (raw) => {
    const res = await request(app)
      .post('/api/swipes')
      .set('Content-Type', 'application/json')
      .send(raw)
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('INVALID_JSON')
  })
})

describe('POST /api/swipes: business rules', () => {
  it('404 CARD_NOT_FOUND for a well-formed id that is not in the deck', async () => {
    await seedFixtures()

    const res = await post({ cardId: MISSING_CARD_ID, direction: 'right' })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: { code: 'CARD_NOT_FOUND', message: 'Card not found.' } })
    expect(await countSwipes()).toBe(0)
  })

  it('409 ALREADY_SWIPED for a second swipe on the same card, history unchanged', async () => {
    const { cardIds } = await seedFixtures()
    const first = await post({ cardId: cardIds[0], direction: 'right' })

    const second = await post({ cardId: cardIds[0], direction: 'left' })

    expect(second.status).toBe(409)
    expect(second.body).toEqual({
      error: { code: 'ALREADY_SWIPED', message: 'Card has already been swiped.' },
    })
    expect((await list()).body).toEqual([first.body])
  })

  it('lets exactly one of several simultaneous swipes on the same card win (unique index)', async () => {
    const { cardIds } = await seedFixtures()

    for (const cardId of cardIds) {
      const responses = await Promise.all(
        Array.from({ length: 4 }, () => post({ cardId, direction: 'right' })),
      )
      expect(sortedStatuses(responses)).toEqual([201, 409, 409, 409])
    }

    expect(await countSwipes()).toBe(cardIds.length)
  })
})

describe('DELETE /api/swipes/last', () => {
  it('404 HISTORY_EMPTY when the history is empty', async () => {
    await seedFixtures()

    const res = await undo()

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: { code: 'HISTORY_EMPTY', message: 'No swipe to undo.' } })
  })

  it('undoes swipes in LIFO order and then reports an empty stack', async () => {
    const { cardIds } = await seedFixtures()
    const [a, b, c] = await swipeInOrder([
      [cardIds[0], 'right'],
      [cardIds[1], 'left'],
      [cardIds[2], 'right'],
    ])
    expect((await list()).body).toEqual([a, b, c])

    const first = await undo()
    expect(first.status).toBe(200)
    expect(first.body).toEqual(c)
    expect((await list()).body).toEqual([a, b])

    const second = await undo()
    expect(second.status).toBe(200)
    expect(second.body).toEqual(b)
    expect((await list()).body).toEqual([a])

    const third = await undo()
    expect(third.status).toBe(200)
    expect(third.body).toEqual(a)
    expect((await list()).body).toEqual([])

    const fourth = await undo()
    expect(fourth.status).toBe(404)
    expect(fourth.body.error.code).toBe('HISTORY_EMPTY')
  })

  it('lets a card be swiped again after its swipe was undone', async () => {
    const { cardIds } = await seedFixtures()
    await post({ cardId: cardIds[0], direction: 'left' })
    expect((await undo()).status).toBe(200)

    const again = await post({ cardId: cardIds[0], direction: 'right' })

    expect(again.status).toBe(201)
    expect((await list()).body).toEqual([again.body])
  })

  it('removes two different swipes for two simultaneous undos', async () => {
    const { cardIds } = await seedFixtures()
    const created = await swipeInOrder([
      [cardIds[0], 'right'],
      [cardIds[1], 'left'],
    ])

    const responses = await Promise.all([undo(), undo()])

    expect(sortedStatuses(responses)).toEqual([200, 200])
    expect(responses.map((res) => res.body.id).sort()).toEqual(created.map((swipe) => swipe.id).sort())
    expect(await countSwipes()).toBe(0)
  })

  it('answers 200 once and 404 once for two simultaneous undos on a single swipe', async () => {
    const { cardIds } = await seedFixtures()
    await swipeInOrder([[cardIds[0], 'right']])

    const responses = await Promise.all([undo(), undo()])

    expect(sortedStatuses(responses)).toEqual([200, 404])
    expect(await countSwipes()).toBe(0)
  })
})
