import { test, expect } from 'vitest';
import mongoose from 'mongoose';
import { useTestDb } from './helpers/db.js';

useTestDb();

test('in-memory MongoDB is reachable', async () => {
  const result = await mongoose.connection.db.admin().ping();
  expect(result.ok).toBe(1);
});
