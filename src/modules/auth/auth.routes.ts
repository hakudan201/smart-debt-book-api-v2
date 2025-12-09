import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify'
import {
  registerSchema,
  loginSchema,
  getProfileSchema,
  refreshSchema,
  logoutSchema
} from './schemas/index.js'

/**
 * Auth Routes - Define all authentication endpoints
 */
async function authRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  const authController = fastify.authController

  // POST /auth/register
  fastify.post('/register', {
    schema: registerSchema
  }, async function registerHandler(request: FastifyRequest, reply: FastifyReply) {
    return await authController.register(request as FastifyRequest<{ Body: { email: string; password: string; fullname: string } }>, reply)
  })

  // POST /auth/login
  fastify.post('/login', {
    schema: loginSchema
  }, async function loginHandler(request: FastifyRequest, reply: FastifyReply) {
    return await authController.login(request as FastifyRequest<{ Body: { email: string; password: string } }>, reply)
  })

  // GET /auth/me (protected)
  fastify.get('/me', {
    schema: getProfileSchema,
    preHandler: [fastify.authenticate]
  }, async function getProfileHandler(request, reply) {
    return await authController.getProfile(request, reply)
  })

  // POST /auth/refresh
  fastify.post('/refresh', {
    schema: refreshSchema
  }, async function refreshHandler(request, reply) {
    return await authController.refresh(request, reply)
  })

  // POST /auth/logout
  fastify.post('/logout', {
    schema: logoutSchema
  }, async function logoutHandler(request, reply) {
    return await authController.logout(request, reply)
  })
}

export default fp(authRoutes, {
  name: 'auth-routes',
  encapsulate: true
})

