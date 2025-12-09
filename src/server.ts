import Fastify from 'fastify'
import app from './app.js'
import { options } from './app.js'

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
})

const port = Number(process.env.PORT) || 3000
const host = process.env.HOST || '0.0.0.0'

// Register the app
server.register(app, options)

// Start the server
const start = async () => {
  try {
    await server.listen({ port, host })
    server.log.info(`🚀 Server running on http://${host}:${port}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()

