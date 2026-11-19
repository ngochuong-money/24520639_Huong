import { ApiError } from '../errors.js'

export function notFoundHandler(req, res, next) {
  next(new ApiError(404, 'ROUTE_NOT_FOUND', 'Route not found.'))
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }

  if (err instanceof ApiError) {
    const error = { code: err.code, message: err.message }
    if (err.details) {
      error.details = err.details
    }
    return res.status(err.status).json({ error })
  }

  if (err?.type === 'entity.parse.failed') {
    return res
      .status(400)
      .json({ error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } })
  }

  console.error(err)
  return res
    .status(500)
    .json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } })
}
