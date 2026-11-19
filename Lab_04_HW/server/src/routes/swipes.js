import { Router } from 'express'
import { validateSwipeInput } from '../../../shared/validation.js'
import { ApiError, validationError } from '../errors.js'
import Card from '../models/Card.js'
import Swipe from '../models/Swipe.js'

export const swipesRouter = Router()

const alreadySwiped = () => new ApiError(409, 'ALREADY_SWIPED', 'Card has already been swiped.')

// Oldest to newest: the last element is the top of the undo stack.
swipesRouter.get('/', async (req, res) => {
  const swipes = await Swipe.find({}).sort({ createdAt: 1, _id: 1 }).exec()
  res.json(swipes)
})

swipesRouter.post('/', async (req, res) => {
  // Express 5: req.body is undefined when no JSON body was parsed;
  // validateSwipeInput reports that as a "body" error.
  const errors = validateSwipeInput(req.body)
  if (errors.length > 0) {
    throw validationError(errors)
  }

  // Pick only the contract fields: extra fields are ignored and never persisted.
  const { cardId, direction } = req.body

  if (!(await Card.exists({ _id: cardId }).exec())) {
    throw new ApiError(404, 'CARD_NOT_FOUND', 'Card not found.')
  }
  if (await Swipe.exists({ cardId }).exec()) {
    throw alreadySwiped()
  }

  try {
    const swipe = await Swipe.create({ cardId, direction })
    res.status(201).json(swipe)
  } catch (error) {
    // Two concurrent requests can both pass the check above; the unique index on cardId decides.
    if (error?.code === 11000) {
      throw alreadySwiped()
    }
    throw error
  }
})
