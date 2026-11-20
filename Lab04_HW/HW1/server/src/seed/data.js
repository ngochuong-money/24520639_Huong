export const PHOTO_CATEGORIES = Object.freeze(['evidence', 'scenes', 'documents'])

const CATEGORY_LABELS = Object.freeze({
  evidence: 'Evidence',
  scenes: 'Scene',
  documents: 'Document',
})
const PHOTOS_PER_CATEGORY = 4

// Round-robin order (evidence 01, scene 01, document 01, evidence 02, ...)
// so the "All" view is mixed. Placeholder images: replace src/alt with real ones later.
export const photos = Array.from({ length: PHOTOS_PER_CATEGORY }, (_, index) => {
  const number = String(index + 1).padStart(2, '0')
  return PHOTO_CATEGORIES.map((category) => {
    const label = CATEGORY_LABELS[category]
    return {
      title: `${label} ${number}`,
      alt: `Placeholder image for ${label.toLowerCase()} ${number}`,
      category,
      src: `/images/photos/${category}-${number}.svg`,
      width: 1200,
      height: 800,
    }
  })
}).flat()

const CARD_PROFILES = [
  ['Minh Anh', 'Coffee snob, weekend hiker, terrible at keeping plants alive.'],
  ['Gia Bao', 'Night-shift developer who still believes in handwritten letters.'],
  ['Thu Ha', 'Street food explorer with a spreadsheet of every pho shop in town.'],
  ['Quoc Khanh', 'Plays guitar badly, cooks surprisingly well.'],
  ['Lan Phuong', 'Marathon runner who sleeps through every alarm except race day.'],
  ['Duc Anh', 'Board game referee. Will read the full rulebook out loud.'],
  ['Bao Ngoc', 'Film school dropout, keeps a ranked list of every movie ending.'],
  ['Tuan Kiet', 'Motorbike road trips, always lost, never worried.'],
  ['Khanh Linh', 'Bakes at midnight and gives the results to the neighbours.'],
  ['Hoang Nam', 'Collects vinyl records and strong opinions about them.'],
]

export const cards = CARD_PROFILES.map(([name, bio], index) => ({
  name,
  bio,
  imageUrl: `/images/cards/card-${String(index + 1).padStart(2, '0')}.svg`,
}))
