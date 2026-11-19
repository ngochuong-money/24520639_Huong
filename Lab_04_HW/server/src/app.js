import cors from 'cors'
import express from 'express'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.use(cors())
  app.use(express.json())

  // Routers are mounted here under /api from task 2.4 onward.

  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}
