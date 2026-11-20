import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { createApp } from './app.js'
import { loadConfig } from './config.js'

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) })

async function main() {
  const { port, mongodbUri } = loadConfig()
  await mongoose.connect(mongodbUri, { serverSelectionTimeoutMS: 5000 })
  console.log('MongoDB connected')

  createApp().listen(port, (error) => {
    if (error) {
      console.error('Failed to listen:', error.message)
      process.exit(1)
    }
    console.log(`API listening on http://localhost:${port}`)
  })
}

main().catch((error) => {
  console.error('Failed to start server:', error.message)
  process.exit(1)
})
