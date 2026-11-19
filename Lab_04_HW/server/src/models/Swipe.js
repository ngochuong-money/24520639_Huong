import mongoose from 'mongoose'
import { DIRECTIONS } from '../../../shared/validation.js'
import { jsonOptions } from './helpers.js'

const swipeSchema = new mongoose.Schema(
  {
    // unique: a card can be in the history only once (409 ALREADY_SWIPED is mapped from E11000 in task 2.5)
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true, unique: true },
    direction: { type: String, required: true, enum: [...DIRECTIONS] },
  },
  { timestamps: { createdAt: true, updatedAt: false }, toJSON: jsonOptions },
)

// "Last" swipe = greatest createdAt, ties broken by greatest _id.
swipeSchema.index({ createdAt: -1, _id: -1 })

export default mongoose.model('Swipe', swipeSchema)
