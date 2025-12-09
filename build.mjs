import { execSync } from 'child_process'

// Build the source code using TypeScript compiler to generate .d.ts files
// This allows api/index.ts to import from ../dist/app with proper types
console.log('🔨 Building source code with TypeScript...')

try {
  execSync('npx tsc --project tsconfig.json', { stdio: 'inherit' })
  console.log('✅ Source build complete!')
} catch (error) {
  console.error('❌ Build failed:', error)
  process.exit(1)
}

