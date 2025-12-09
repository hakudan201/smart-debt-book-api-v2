import Fastify from 'fastify'
import app from '../dist/app.js'
import { options } from '../dist/app.js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// Create a singleton Fastify instance for serverless
let fastifyInstance: ReturnType<typeof Fastify> | null = null

async function getFastifyInstance() {
  if (!fastifyInstance) {
    fastifyInstance = Fastify({
      logger: {
        level: process.env.LOG_LEVEL || 'info'
      }
    })

    // Register the app plugin
    await fastifyInstance.register(app, options)

    // Wait for Fastify to be ready
    await fastifyInstance.ready()
  }

  return fastifyInstance
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fastify = await getFastifyInstance()

  // Convert Vercel request to Fastify-compatible format
  const url = req.url || '/'
  const method = req.method || 'GET'

  // Build headers (including cookies)
  const headers: Record<string, string> = {}
  if (req.headers) {
    Object.keys(req.headers).forEach(key => {
      const value = req.headers[key]
      if (typeof value === 'string') {
        headers[key] = value
      } else if (Array.isArray(value) && value.length > 0) {
        headers[key] = value[0]
      }
    })
  }

  // Build query string
  const query = req.query || {}
  const queryString = new URLSearchParams(query as Record<string, string>).toString()
  const fullUrl = queryString ? `${url}?${queryString}` : url

  // Prepare payload
  let payload: string | undefined
  if (req.body) {
    if (typeof req.body === 'string') {
      payload = req.body
    } else if (Buffer.isBuffer(req.body)) {
      payload = req.body.toString('utf8')
    } else {
      payload = JSON.stringify(req.body)
      // Set content-type if not already set
      if (!headers['content-type'] && !headers['Content-Type']) {
        headers['content-type'] = 'application/json'
      }
    }
  }

  // Remove content-length header as Fastify will calculate it
  const contentLengthKey = Object.keys(headers).find(
    key => key.toLowerCase() === 'content-length'
  )
  if (contentLengthKey) {
    delete headers[contentLengthKey]
  }

  // Use Fastify's inject method to handle the request
  const response = await fastify.inject({
    method: method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS',
    url: fullUrl,
    headers,
    payload
  })

  // Set response status and headers
  res.statusCode = response.statusCode

  // Fastify inject returns headers as a plain object, not iterable
  if (response.headers) {
    Object.keys(response.headers).forEach(key => {
      // Skip content-length as Vercel handles it
      if (key.toLowerCase() !== 'content-length') {
        const value = response.headers[key]
        if (value !== undefined) {
          res.setHeader(key, value)
        }
      }
    })
  }

  // Send response body
  res.end(response.body)
}

