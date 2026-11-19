import { Router } from 'express'
import { VALIDATION_MESSAGES, isValidCategory } from '../../../shared/validation.js'
import { validationError } from '../errors.js'
import Photo from '../models/Photo.js'

export const photosRouter = Router()

photosRouter.get('/', async (req, res) => {
  const { category } = req.query
  const filter = {}

  if (category !== undefined) {
    // A repeated key arrives as an array and is rejected by isValidCategory.
    if (!isValidCategory(category)) {
      throw validationError([
        { field: 'category', message: VALIDATION_MESSAGES.category },
      ])
    }
    filter.category = category
  }

  const photos = await Photo.find(filter).sort({ _id: 1 }).exec()
  res.json(photos)
})
