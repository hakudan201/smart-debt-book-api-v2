import type { FastifySchema } from 'fastify'

/**
 * Register Route Schema
 */
export const registerSchema: FastifySchema = {
  tags: ['auth'],
  summary: 'Register a new user',
  description: 'Create a new user account. After successful registration, the user is automatically logged in and receives an access token.',
  body: {
    type: 'object',
    required: ['email', 'password', 'fullname'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'User email address',
        example: 'user@example.com'
      },
      password: {
        type: 'string',
        minLength: 8,
        description: 'User password. Must be at least 8 characters, contain uppercase, lowercase, and number',
        example: 'SecurePass123'
      },
      fullname: {
        type: 'string',
        description: 'User full name',
        example: 'John Doe'
      }
    }
  },
  response: {
    201: {
      description: 'User successfully registered and logged in',
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'JWT access token for authenticated requests'
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
      description: 'Bad request - validation error',
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Email, password, and fullname are required' }
      }
    },
    409: {
      description: 'Conflict - user already exists',
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User with this email already exists' }
      }
    }
  }
}

