import fp from 'fastify-plugin'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import type { FastifyInstance, FastifyPluginOptions } from 'fastify'

/**
 * Documentation Plugin - Registers Swagger and Scalar API reference
 */
async function documentationPlugin(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  // Register Swagger to generate OpenAPI schema
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Smart Debt Book API',
        description: 'API documentation for Smart Debt Book',
        version: '1.0.0'
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 3000}`,
          description: 'Development server'
        }
      ],
      tags: [
        { name: 'auth', description: 'Authentication endpoints' }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    }
  })

  // Register Swagger UI
  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    },
    staticCSP: true,
    transformStaticCSP: (header) => header
  })
}

export default fp(documentationPlugin, {
  name: 'documentation'
})

