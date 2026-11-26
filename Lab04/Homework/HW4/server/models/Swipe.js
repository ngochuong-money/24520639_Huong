import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { DIRECTIONS } from '../../shared/swipeRules.js';
import { toJSONOptions } from './toJSON.js';

const swipeSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => randomUUID(), unique: true },
    profileId: { type: String, required: true, unique: true }, // one swipe per profile
    direction: { type: String, required: true, enum: DIRECTIONS },
    createdAt: { type: Date, default: () => new Date() },
  },
  { toJSON: toJSONOptions },
);

swipeSchema.index({ createdAt: 1 });

export const Swipe = mongoose.models.Swipe ?? mongoose.model('Swipe', swipeSchema);
