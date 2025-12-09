import type { FastifySchema } from 'fastify'

/**
 * Refresh Token Route Schema
 */
export const refreshSchema: FastifySchema = {
  tags: ['auth'],
  summary: 'Refresh access token',
  description: 'Get a new access token using a refresh token stored in httpOnly cookie. The refresh token is rotated (old one revoked, new one issued) for security.',
  response: {
    200: {
      description: 'Token refreshed successfully',
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'New JWT access token'
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'User ID' },
            email: { type: 'string', format: 'email', description: 'User email' },
            fullname: { type: 'string', description: 'User full name' }
          }
        }
      }
    },
    401: {
      description: 'Unauthorized - invalid or expired refresh token',
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  }
}

