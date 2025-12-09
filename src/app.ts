import path from 'path'
import { fileURLToPath } from 'url'
import AutoLoad from '@fastify/autoload'
import scalarApiReference from '@scalar/fastify-api-reference'
import cookie from '@fastify/cookie'
import type { FastifyInstance, FastifyPluginOptions } from 'fastify'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Pass --options via CLI arguments in command to enable these options.
const options = {}

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  // Place here your custom code!

  // Register cookie plugin globally
  await fastify.register(cookie)

  // Welcome route
  fastify.get('/', async () => {
    return {
      message: 'Welcome to Smart Debt Book API',
      version: '1.0.0',
      documentation: '/reference'
    }
  })

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all modules defined in modules directory
  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'modules'),
    maxDepth: 1,
    dirNameRoutePrefix: false,
    matchFilter: (path: string) => path.endsWith('.module.js'),
    options: Object.assign({}, opts)
  })

  // Register Scalar API reference after routes are loaded (optional in prod)
  const enableScalar = process.env.ENABLE_SCALAR !== 'false'
  if (enableScalar) {
    try {
      await fastify.register(scalarApiReference, {
        routePrefix: '/reference'
      })
    } catch (err) {
      fastify.log.warn({ err }, 'Scalar API reference failed to load')
    }
  } else {
    fastify.log.info('Scalar API reference disabled (ENABLE_SCALAR=false)')
  }
}

export { options }

