export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function validationError(details) {
  return new ApiError(400, 'VALIDATION_ERROR', 'Request validation failed.', details)
}
