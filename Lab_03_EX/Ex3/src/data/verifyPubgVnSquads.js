
import { PUBG_VN_SQUADS } from './pubgVnSquads.js'

const expectedSquads = [
  ['ces', 'Cerberus Esports', 'Erangel', 'Phase 6', 4, 14, '68%', 'In Safe Zone'],
  ['te', 'The Expendables', 'Miramar', 'Phase 7', 4, 18, '82%', 'Holding High Ground'],
  ['ge', 'Genius Esports', 'Taego', 'Phase 5', 3, 9, '41%', 'Rotating Blue Zone'],
]

const fields = [
  'id',
  'name',
  'map',
  'phase',
  'alive',
  'kills',
  'wwcdProb',
  'status',
]

function verifySquads() {
  if (PUBG_VN_SQUADS.length !== 3) {
    throw new Error('Dataset must contain exactly 3 squads')
  }

  const ids = PUBG_VN_SQUADS.map((squad) => squad.id)

  if (new Set(ids).size !== ids.length) {
    throw new Error('Squad IDs must be unique')
  }

  for (const [index, squad] of PUBG_VN_SQUADS.entries()) {
    const expected = expectedSquads[index]

    if (
      Object.keys(squad).length !== fields.length ||
      fields.some((field) => !(field in squad))
    ) {
      throw new Error(`Invalid schema at index ${index}`)
    }

    for (const field of ['id', 'name', 'map', 'phase', 'wwcdProb', 'status']) {
      if (typeof squad[field] !== 'string' || !squad[field].trim()) {
        throw new Error(`Invalid ${field} at index ${index}`)
      }
    }

    for (const field of ['alive', 'kills']) {
      if (!Number.isInteger(squad[field]) || squad[field] < 0) {
        throw new Error(`Invalid ${field} at index ${index}`)
      }
    }

    if (squad.alive > 4) {
      throw new Error(`Invalid alive count at index ${index}`)
    }

    for (const [fieldIndex, field] of fields.entries()) {
      if (squad[field] !== expected[fieldIndex]) {
        throw new Error(`Incorrect ${field} for ${squad.id}`)
      }
    }
  }

  console.log('PASS: 3 squads, unique IDs, valid schema and expected values')
}

verifySquads()
