import { execSync } from 'child_process'

// Build the source code using TypeScript compiler to generate .d.ts files
// With moduleResolution: "nodenext", TypeScript requires .js extensions in source files
// This ensures proper ESM support and type checking
console.log('🔨 Building source code with TypeScript...')

try {
  execSync('npx tsc --project tsconfig.json', { stdio: 'inherit' })
  console.log('✅ Source build complete!')
} catch (error) {
  console.error('❌ Build failed:', error)
  process.exit(1)
}

