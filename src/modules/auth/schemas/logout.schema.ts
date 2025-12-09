import type { FastifySchema } from 'fastify'

/**
 * Logout Route Schema
 */
export const logoutSchema: FastifySchema = {
  tags: ['auth'],
  summary: 'Logout user',
  description: 'Revoke the refresh token stored in httpOnly cookie and clear the cookie. This effectively logs out the user.',
  response: {
    200: {
      description: 'Logout successful',
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Logged out successfully'
        }
      }
    }
  }
}

