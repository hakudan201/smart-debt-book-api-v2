import { build } from 'esbuild'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Build the API handler for Vercel
console.log('🔨 Starting build...')
console.log(`📦 Entry: api/index.ts`)
console.log(`📤 Output: api/index.js`)

const result = await build({
  entryPoints: ['api/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'api/index.js',
  external: [
    '@prisma/client',
    '@prisma/adapter-pg',
    'pg',
    'fastify',
    '@fastify/autoload',
    '@fastify/cookie',
    '@fastify/jwt',
    '@fastify/sensible',
    '@fastify/swagger',
    '@fastify/swagger-ui',
    '@scalar/fastify-api-reference',
    '@vercel/node',
    'argon2',
    'jsonwebtoken',
    'fastify-plugin'
  ],
  resolveExtensions: ['.ts', '.js', '.json'],
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);"
  },
  logLevel: 'info',
  keepNames: true
})

console.log('✅ Build complete!')
console.log(`📊 Output size: ${result.metafile ? 'See metafile' : 'N/A'}`)

