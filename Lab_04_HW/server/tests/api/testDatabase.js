export const DEFAULT_TEST_URI = 'mongodb://127.0.0.1:27017/lab04_hw_test'
const TEST_DB_SUFFIX = '_test'

// Deliberately independent of MONGODB_URI: API tests delete data and must never touch the dev database.
export function getTestMongoUri(env = process.env) {
  return env.MONGODB_TEST_URI?.trim() || DEFAULT_TEST_URI
}

export function isSafeTestDatabase(name) {
  return typeof name === 'string' && name.length > TEST_DB_SUFFIX.length && name.endsWith(TEST_DB_SUFFIX)
}
