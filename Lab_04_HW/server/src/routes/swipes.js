import { Router } from 'express'
import Swipe from '../models/Swipe.js'

export const swipesRouter = Router()

// Oldest to newest: the last element is the top of the undo stack.
swipesRouter.get('/', async (req, res) => {
  const swipes = await Swipe.find({}).sort({ createdAt: 1, _id: 1 }).exec()
  res.json(swipes)
})
