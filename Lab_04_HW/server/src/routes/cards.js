import { Router } from 'express'
import Card from '../models/Card.js'

export const cardsRouter = Router()

// Deck order = _id ascending (seed order).
cardsRouter.get('/', async (req, res) => {
  const cards = await Card.find({}).sort({ _id: 1 }).exec()
  res.json(cards)
})
