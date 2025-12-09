import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'
import type { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify'
import { UnauthorizedError } from '../utils/errors'

/**
 * JWT plugin - Handles JWT token generation and verification
 */
async function jwtPlugin(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-this',
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    }
  })

  // Helper decorator to verify JWT and attach user to request
  // @fastify/jwt automatically attaches decoded payload to request.user
  fastify.decorate('authenticate', async function authenticate(request: FastifyRequest): Promise<void> {
    try {
      await request.jwtVerify()
      // request.user is automatically set by @fastify/jwt with the decoded payload
    } catch (error) {
      throw new UnauthorizedError('Authentication failed: ' + (error as Error).message)
    }
  })
}

export default fp(jwtPlugin, {
  name: 'jwt'
})

// Extend Fastify types for JWT
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

