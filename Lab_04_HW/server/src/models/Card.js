import mongoose from 'mongoose'
import { isImageUrl, jsonOptions } from './helpers.js'

const cardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    bio: { type: String, default: '', trim: true, maxlength: 280 },
    imageUrl: {
      type: String,
      required: true,
      validate: { validator: isImageUrl, message: 'Must be a relative path or an https URL.' },
    },
  },
  { toJSON: jsonOptions },
)

export default mongoose.model('Card', cardSchema)
