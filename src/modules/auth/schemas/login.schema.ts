import type { FastifySchema } from 'fastify'

/**
 * Login Route Schema
 */
export const loginSchema: FastifySchema = {
  tags: ['auth'],
  summary: 'Login user',
  description: 'Authenticate user with email and password. Returns access token, refresh token, and user information.',
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'User email address',
        example: 'user@example.com'
      },
      password: {
        type: 'string',
        description: 'User password',
        example: 'SecurePass123'
      }
    }
  },
  response: {
    200: {
      description: 'Login successful',
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'JWT access token (expires in 1 hour by default)'
        },
        refreshToken: {
          type: 'string',
          description: 'Refresh token for obtaining new access tokens (stored in httpOnly cookie)'
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
    400: {
      description: 'Bad request - missing credentials',
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Email and password are required' }
      }
    },
    401: {
      description: 'Unauthorized - invalid credentials',
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid credentials' }
      }
    }
  }
}

