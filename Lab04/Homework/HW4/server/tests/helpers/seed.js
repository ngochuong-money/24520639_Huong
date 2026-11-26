import mongoose from 'mongoose';
import { profiles } from '../../seed/profiles.data.js';

/** Inserts the seed profiles directly into the collection (raw docs get a Mongo _id, like real data). */
export async function seedProfiles() {
  const docs = profiles.map((p, order) => ({ ...p, interests: [...p.interests], order }));
  await mongoose.connection.collection('profiles').insertMany(docs);
  return docs;
}
