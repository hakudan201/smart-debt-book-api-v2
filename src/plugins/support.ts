import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyPluginOptions } from 'fastify'

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

async function supportPlugin(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  fastify.decorate('someSupport', function () {
    return 'hugs'
  })
}

export default fp(supportPlugin)

// Extend Fastify types
declare module 'fastify' {
  interface FastifyInstance {
    someSupport: () => string
  }
}

