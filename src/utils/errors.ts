/**
 * Custom Error Classes for the application
 * These errors can be thrown and will be handled by the error handler
 */

/**
 * Base HTTP Error class
 */
export class HttpError extends Error {
  statusCode: number
  details: unknown

  constructor(message: string, statusCode = 500, details: unknown = null) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.details = details

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (Error as any).captureStackTrace === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Error as any).captureStackTrace(this, this.constructor)
    }
  }
}

/**
 * 400 Bad Request Error
 */
export class BadRequestError extends HttpError {
  constructor(message = 'Bad Request', details: unknown = null) {
    super(message, 400, details)
  }
}

/**
 * 401 Unauthorized Error
 */
export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized', details: unknown = null) {
    super(message, 401, details)
  }
}

/**
 * 403 Forbidden Error
 */
export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden', details: unknown = null) {
    super(message, 403, details)
  }
}

/**
 * 404 Not Found Error
 */
export class NotFoundError extends HttpError {
  constructor(message = 'Not Found', details: unknown = null) {
    super(message, 404, details)
  }
}

/**
 * 409 Conflict Error
 */
export class ConflictError extends HttpError {
  constructor(message = 'Conflict', details: unknown = null) {
    super(message, 409, details)
  }
}

/**
 * 422 Unprocessable Entity Error
 */
export class UnprocessableEntityError extends HttpError {
  constructor(message = 'Unprocessable Entity', details: unknown = null) {
    super(message, 422, details)
  }
}

/**
 * 429 Too Many Requests Error
 */
export class TooManyRequestsError extends HttpError {
  constructor(message = 'Too Many Requests', details: unknown = null) {
    super(message, 429, details)
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends HttpError {
  constructor(message = 'Internal Server Error', details: unknown = null) {
    super(message, 500, details)
  }
}

/**
 * 503 Service Unavailable Error
 */
export class ServiceUnavailableError extends HttpError {
  constructor(message = 'Service Unavailable', details: unknown = null) {
    super(message, 503, details)
  }
}

