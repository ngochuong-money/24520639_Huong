import mongoose from 'mongoose';
import { toJSONOptions } from './toJSON.js';

const profileSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    order: { type: Number, required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true, min: 18 },
    city: { type: String, required: true },
    bio: { type: String, required: true },
    interests: { type: [String], default: [] },
    avatar: { type: String, required: true },
    avatarAlt: { type: String, required: true },
  },
  { toJSON: toJSONOptions },
);

profileSchema.index({ order: 1 });

export const Profile = mongoose.models.Profile ?? mongoose.model('Profile', profileSchema);
