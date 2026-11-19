import Card from '../models/Card.js'
import Photo from '../models/Photo.js'
import Swipe from '../models/Swipe.js'
import { cards as defaultCards, photos as defaultPhotos } from './data.js'

function collectErrors(label, docs) {
  return docs.flatMap((doc, index) => {
    const error = doc.validateSync()
    if (!error) {
      return []
    }
    return Object.entries(error.errors).map(
      ([path, pathError]) => `${label}[${index}].${path}: ${pathError.message}`,
    )
  })
}

export async function seedDatabase({ photos = defaultPhotos, cards = defaultCards } = {}) {
  // Documents are built in array order, so their ObjectIds ascend in deck order.
  const photoDocs = photos.map((photo) => new Photo(photo))
  const cardDocs = cards.map((card) => new Card(card))

  // Validate everything BEFORE deleting anything.
  const errors = [...collectErrors('photos', photoDocs), ...collectErrors('cards', cardDocs)]
  if (errors.length > 0) {
    throw new Error(`Invalid seed data:\n${errors.join('\n')}`)
  }

  // Swipes reference cards, so they must go together with the old cards.
  await Swipe.deleteMany({}).exec()
  await Card.deleteMany({}).exec()
  await Photo.deleteMany({}).exec()

  await Photo.insertMany(photoDocs)
  await Card.insertMany(cardDocs)

  return { photos: photoDocs.length, cards: cardDocs.length }
}
