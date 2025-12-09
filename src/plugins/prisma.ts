import fp from 'fastify-plugin'
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import type { FastifyInstance, FastifyPluginOptions } from 'fastify'

/**
 * Prisma plugin - Makes PrismaClient available throughout the application
 * via fastify.prisma decorator
 *
 * Prisma 7: Uses adapter-pg for PostgreSQL connection
 */
async function prismaPlugin(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  // Create PostgreSQL pool and adapter for Prisma 7
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)

  // Create PrismaClient with adapter
  const prisma = new PrismaClient({ adapter })

  // Decorate fastify instance with prisma
  fastify.decorate('prisma', prisma)

  // Disconnect Prisma on app shutdown
  fastify.addHook('onClose', async function onClose(_instance) {
    await prisma.$disconnect()
    await pool.end()
  })
}

export default fp(prismaPlugin, {
  name: 'prisma'
})

// Extend Fastify types
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

