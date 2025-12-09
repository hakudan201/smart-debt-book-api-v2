import { build } from 'esbuild'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Build the source code for Vercel (similar to reference project)
// This builds the src directory so api/index.ts can import from ../dist/app
console.log('🔨 Building source code...')

const result = await build({
  entryPoints: ['src/app.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'dist/app.js',
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

console.log('✅ Source build complete!')

