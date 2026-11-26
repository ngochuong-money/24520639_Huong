/**
 * Reads and validates server configuration. Pure: takes an env object, never touches process.
 * @throws {Error} when MONGODB_URI is missing
 */
export function loadConfig(env = process.env) {
  const mongoUri = env.MONGODB_URI?.trim();
  if (!mongoUri) {
    throw new Error('MONGODB_URI missing — copy server/.env.example to server/.env');
  }

  const port = Number(env.PORT ?? 3001);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`PORT must be a positive integer, got "${env.PORT}"`);
  }

  return {
    mongoUri,
    port,
    clientOrigin: env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  };
}
