import Card from '../../src/models/Card.js'
import Photo from '../../src/models/Photo.js'
import Swipe from '../../src/models/Swipe.js'

function makePhoto(category, number) {
  const suffix = String(number).padStart(2, '0')
  return {
    title: `${category} ${suffix}`,
    alt: `Test image ${category} ${suffix}`,
    category,
    src: `/images/photos/${category}-${suffix}.svg`,
    width: 1200,
    height: 800,
  }
}

export const cardInputs = [
  { name: 'Card A', bio: 'First test card.', imageUrl: '/images/cards/card-01.svg' },
  { name: 'Card B', bio: 'Second test card.', imageUrl: '/images/cards/card-02.svg' },
  { name: 'Card C', bio: 'Third test card.', imageUrl: '/images/cards/card-03.svg' },
]

// Mixed categories on purpose; evidence appears twice.
export const photoInputs = [
  makePhoto('evidence', 1),
  makePhoto('scenes', 1),
  makePhoto('documents', 1),
  makePhoto('evidence', 2),
]

export async function resetDatabase() {
  await Swipe.deleteMany({}).exec()
  await Card.deleteMany({}).exec()
  await Photo.deleteMany({}).exec()
}

// Documents are built in array order, so their ObjectIds ascend in that order.
export async function seedFixtures() {
  const cards = await Card.insertMany(cardInputs.map((input) => new Card(input)))
  const photos = await Photo.insertMany(photoInputs.map((input) => new Photo(input)))
  return {
    cardIds: cards.map((card) => card.id),
    photoIds: photos.map((photo) => photo.id),
  }
}
