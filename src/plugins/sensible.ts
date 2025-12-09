import fp from 'fastify-plugin'
import sensible from '@fastify/sensible'
import type { FastifyInstance, FastifyPluginOptions } from 'fastify'

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
async function sensiblePlugin(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  await fastify.register(sensible)
}

export default fp(sensiblePlugin)

