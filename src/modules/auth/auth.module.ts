import fp from 'fastify-plugin'
import authRoutes from './auth.routes'
import createAuthService from './auth.service'
import createAuthController from './auth.controller'
import type { FastifyInstance, FastifyPluginOptions } from 'fastify'

/**
 * Auth Module - Registers authentication routes and services
 *
 * Note: Using fastify-plugin to ensure dependencies are available
 * and to make decorators available to parent scope
 */
async function authModule(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  // Check if already registered to prevent duplicate routes
  if (fastify.hasDecorator('authService')) {
    fastify.log.warn('Auth module already registered, skipping duplicate registration')
    return
  }

  // Create and decorate auth service
  const authService = createAuthService(fastify)
  fastify.decorate('authService', authService)

  // Create and decorate auth controller
  const authController = createAuthController(fastify)
  fastify.decorate('authController', authController)

  // Register auth routes with /auth prefix
  await fastify.register(authRoutes, { prefix: '/auth' })
}

export default fp(authModule, {
  name: 'auth-module',
  dependencies: ['prisma', 'jwt']
})

// Extend Fastify types
declare module 'fastify' {
  interface FastifyInstance {
    authService: ReturnType<typeof createAuthService>
    authController: ReturnType<typeof createAuthController>
  }
}

