import cors from 'cors'
import express from 'express'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { cardsRouter } from './routes/cards.js'
import { photosRouter } from './routes/photos.js'
import { swipesRouter } from './routes/swipes.js'

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.use(cors())
  app.use(express.json())

  app.use('/api/cards', cardsRouter)
  app.use('/api/photos', photosRouter)
  app.use('/api/swipes', swipesRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}
