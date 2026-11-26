import mongoose from 'mongoose'
import { afterAll, beforeAll, beforeEach } from 'vitest'
import Card from '../../src/models/Card.js'
import Photo from '../../src/models/Photo.js'
import Swipe from '../../src/models/Swipe.js'
import { resetDatabase } from './fixtures.js'
import { getTestMongoUri, isSafeTestDatabase } from './testDatabase.js'

beforeAll(async () => {
  try {
    await mongoose.connect(getTestMongoUri(), { serverSelectionTimeoutMS: 3000 })
  } catch (error) {
    throw new Error(
      'Cannot connect to the test MongoDB. Is mongod running on 127.0.0.1:27017? ' +
        `Set MONGODB_TEST_URI to use another server. Cause: ${error.message}`,
    )
  }

  const name = mongoose.connection.name
  if (!isSafeTestDatabase(name)) {
    await mongoose.disconnect()
    throw new Error(
      `Refusing to run API tests against database "${name}": its name must end with "_test".`,
    )
  }

  // Wait for the indexes (the unique index on swipes.cardId) before any test runs.
  await Promise.all([Card.init(), Photo.init(), Swipe.init()])
})

beforeEach(async () => {
  await resetDatabase()
})

afterAll(async () => {
  await mongoose.disconnect()
})
