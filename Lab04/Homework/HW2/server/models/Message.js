import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { toJSONOptions } from './toJSON.js';

const messageSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => randomUUID(), unique: true },
    forum: { type: String, required: true },
    author: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  { toJSON: toJSONOptions },
);

messageSchema.index({ forum: 1, createdAt: -1 });

export const Message = mongoose.models.Message ?? mongoose.model('Message', messageSchema);
