import type { FastifySchema } from 'fastify'

/**
 * Get Profile Route Schema
 */
export const getProfileSchema: FastifySchema = {
  tags: ['auth'],
  summary: 'Get current user profile',
  description: 'Get the authenticated user\'s profile information. Requires valid JWT access token in Authorization header.',
  security: [{ bearerAuth: [] }],
  headers: {
    type: 'object',
    properties: {
      authorization: {
        type: 'string',
        description: 'Bearer token'
      }
    },
    required: ['authorization']
  },
  response: {
    200: {
      description: 'User profile retrieved successfully',
      type: 'object',
      properties: {
        userId: {
          type: 'number',
          description: 'User ID'
        },
        email: {
          type: 'string',
          format: 'email',
          description: 'User email address'
        },
        emailVerified: {
          type: 'boolean',
          description: 'Whether the email has been verified'
        }
      }
    },
    401: {
      description: 'Unauthorized - invalid or missing token',
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    },
    404: {
      description: 'User not found',
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  }
}

