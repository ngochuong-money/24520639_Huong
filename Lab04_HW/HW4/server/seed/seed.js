import mongoose from 'mongoose';
import { loadConfig } from '../config.js';
import { Profile } from '../models/Profile.js';
import { profiles } from './profiles.data.js';

try {
  const { mongoUri } = loadConfig();
  await mongoose.connect(mongoUri);

  const ops = profiles.map((p, order) => ({
    updateOne: {
      filter: { id: p.id },
      update: { $set: { ...p, interests: [...p.interests], order } },
      upsert: true,
    },
  }));
  const result = await Profile.bulkWrite(ops);

  console.log(`Seeded profiles — upserted: ${result.upsertedCount}, updated: ${result.modifiedCount}`);
  await mongoose.disconnect();
} catch (err) {
  console.error(`[seed] ${err.message}`);
  process.exit(1);
}
