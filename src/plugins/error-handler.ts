import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply, FastifyError } from 'fastify'
import {
  HttpError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError
} from '../utils/errors.js'

/**
 * Error Handler Plugin - Centralized error handling for the application
 */
async function errorHandlerPlugin(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  fastify.setErrorHandler(async function errorHandler(error: FastifyError & { details?: unknown }, request: FastifyRequest, reply: FastifyReply) {
    // Log the error
    this.log.error({
      err: error,
      url: request.url,
      method: request.method,
      statusCode: error.statusCode
    }, 'Error occurred')

    // Handle custom HTTP errors (NotFoundError, ForbiddenError, etc.)
    if (error instanceof HttpError) {
      reply.code(error.statusCode)
      const response: { message: string; details?: unknown } = {
        message: error.message
      }
      if (error.details) {
        response.details = error.details
      }
      return response
    }

    // Handle validation errors
    if (error.validation) {
      reply.code(400)
      return {
        message: 'Validation error',
        errors: error.validation
      }
    }

    // Handle JWT errors
    if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID' ||
        error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER' ||
        error.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
      reply.code(401)
      return {
        message: 'Unauthorized',
        error: 'Invalid or expired token'
      }
    }

    // Handle Prisma errors
    if (error.code === 'P2002') {
      // Unique constraint violation
      reply.code(409)
      return {
        message: 'Conflict',
        error: 'A record with this value already exists'
      }
    }

    if (error.code === 'P2025') {
      // Record not found
      reply.code(404)
      return {
        message: 'Not found',
        error: 'The requested record was not found'
      }
    }

    // Handle errors with statusCode property (from @fastify/sensible or other sources)
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 600) {
      reply.code(error.statusCode)
      const response: { message: string; details?: unknown } = {
        message: error.message || 'An error occurred'
      }
      if (error.details) {
        response.details = error.details
      }
      return response
    }

    // Default to 500 for unexpected errors
    reply.code(500)
    const defaultResponse: { message: string; stack?: string } = {
      message: (typeof process !== 'undefined' && process.env.NODE_ENV === 'production')
        ? 'Internal server error'
        : error.message || 'Internal server error'
    }
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && error.stack) {
      defaultResponse.stack = error.stack
    }
    return defaultResponse
  })

  // Decorate fastify with error classes for easy access
  fastify.decorate('errors', {
    HttpError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    UnprocessableEntityError,
    TooManyRequestsError,
    InternalServerError,
    ServiceUnavailableError
  })
}

export default fp(errorHandlerPlugin)

// Extend Fastify types
declare module 'fastify' {
  interface FastifyInstance {
    errors: {
      HttpError: typeof HttpError
      BadRequestError: typeof BadRequestError
      UnauthorizedError: typeof UnauthorizedError
      ForbiddenError: typeof ForbiddenError
      NotFoundError: typeof NotFoundError
      ConflictError: typeof ConflictError
      UnprocessableEntityError: typeof UnprocessableEntityError
      TooManyRequestsError: typeof TooManyRequestsError
      InternalServerError: typeof InternalServerError
      ServiceUnavailableError: typeof ServiceUnavailableError
    }
  }
}

