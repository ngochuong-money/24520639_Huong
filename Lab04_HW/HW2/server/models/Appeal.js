import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { toJSONOptions } from './toJSON.js';

const appealSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => randomUUID(), unique: true },
    playerId: { type: String, required: true },
    matchId: { type: String, required: true },
    email: { type: String, required: true },
    reason: { type: String, required: true },
    statement: { type: String, required: true },
    evidenceUrl: { type: String, default: '' },
    createdAt: { type: Date, default: () => new Date() },
  },
  { toJSON: toJSONOptions },
);

appealSchema.index({ playerId: 1, createdAt: -1 });

export const Appeal = mongoose.models.Appeal ?? mongoose.model('Appeal', appealSchema);
