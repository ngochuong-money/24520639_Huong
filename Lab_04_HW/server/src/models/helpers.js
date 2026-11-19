const IMAGE_URL_PATTERN = /^(\/(?!\/)|https:\/\/)\S+$/

// Relative path ("/images/a.jpg") or https URL only; rejects javascript:, http: and //host.
export function isImageUrl(value) {
  return typeof value === 'string' && IMAGE_URL_PATTERN.test(value)
}

export function isPositiveNumber(value) {
  return Number.isFinite(value) && value > 0
}

// Contract: expose `id`, never `_id` or `__v`.
export const jsonOptions = {
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id.toString()
    delete ret._id
    return ret
  },
}
