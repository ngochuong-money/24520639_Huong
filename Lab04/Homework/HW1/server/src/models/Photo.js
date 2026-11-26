import mongoose from 'mongoose'
import { isValidCategory } from '../../../shared/validation.js'
import { isImageUrl, isPositiveNumber, jsonOptions } from './helpers.js'

const photoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    alt: { type: String, required: true, trim: true, maxlength: 250 },
    category: {
      type: String,
      required: true,
      validate: { validator: isValidCategory, message: 'Invalid category slug.' },
    },
    src: {
      type: String,
      required: true,
      validate: { validator: isImageUrl, message: 'Must be a relative path or an https URL.' },
    },
    width: {
      type: Number,
      required: true,
      validate: { validator: isPositiveNumber, message: 'Must be a number greater than 0.' },
    },
    height: {
      type: Number,
      required: true,
      validate: { validator: isPositiveNumber, message: 'Must be a number greater than 0.' },
    },
  },
  { toJSON: jsonOptions },
)

export default mongoose.model('Photo', photoSchema)
