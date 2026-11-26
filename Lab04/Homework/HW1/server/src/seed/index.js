import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { loadConfig } from '../config.js'
import { seedDatabase } from './seed.js'

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) })

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed when NODE_ENV=production.')
  }

  const { mongodbUri } = loadConfig()
  await mongoose.connect(mongodbUri, { serverSelectionTimeoutMS: 5000 })
  try {
    console.log(
      `Seeding database "${mongoose.connection.name}" (existing photos, cards and swipes are replaced)...`,
    )
    const result = await seedDatabase()
    console.log(`Seeded ${result.photos} photos and ${result.cards} cards.`)
  } finally {
    await mongoose.disconnect()
  }
}

main().catch((error) => {
  console.error('Seed failed:', error.message)
  process.exit(1)
})
