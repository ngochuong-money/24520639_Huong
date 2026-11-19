const DEFAULT_PORT = 5000

export function loadConfig(env = process.env) {
  const mongodbUri = env.MONGODB_URI?.trim()
  if (!mongodbUri) {
    throw new Error('MONGODB_URI is not set. Copy server/.env.example to server/.env.')
  }

  const port = env.PORT ? Number(env.PORT) : DEFAULT_PORT
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.')
  }

  return { port, mongodbUri }
}
