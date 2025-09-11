#!/usr/bin/env node

// Build script with timeout and error handling
const { spawn } = require('child_process')
const path = require('path')

const BUILD_TIMEOUT = 10 * 60 * 1000 // 10 minutes
const RETRY_COUNT = 2

async function buildWithTimeout(attempt = 1) {
  console.log(`🏗️ Starting build attempt ${attempt}/${RETRY_COUNT + 1}...`)
  
  return new Promise((resolve, reject) => {
    // Set environment variables for build optimization
    const env = {
      ...process.env,
      NODE_ENV: 'production',
      NEXT_TELEMETRY_DISABLED: '1',
      DISABLE_WALLET_CONNECT_DURING_BUILD: 'true',
      // Disable problematic network requests
      NEXT_PUBLIC_DISABLE_WALLETCONNECT: 'true',
      NEXT_PUBLIC_BUILD_MODE: 'true',
    }

    // Use build-optimized config
    const configPath = path.join(__dirname, '..', 'next.config.build-optimized.js')
    
    const buildProcess = spawn('npx', ['next', 'build'], {
      stdio: 'inherit',
      env,
      cwd: path.join(__dirname, '..'),
    })

    // Set timeout
    const timeout = setTimeout(() => {
      console.log('⏰ Build timeout reached, terminating...')
      buildProcess.kill('SIGTERM')
      
      setTimeout(() => {
        buildProcess.kill('SIGKILL')
      }, 5000)
      
      reject(new Error('Build timeout'))
    }, BUILD_TIMEOUT)

    buildProcess.on('close', (code) => {
      clearTimeout(timeout)
      
      if (code === 0) {
        console.log('✅ Build completed successfully!')
        resolve()
      } else {
        console.log(`❌ Build failed with code ${code}`)
        reject(new Error(`Build failed with code ${code}`))
      }
    })

    buildProcess.on('error', (error) => {
      clearTimeout(timeout)
      console.error('❌ Build process error:', error)
      reject(error)
    })
  })
}

async function main() {
  console.log('🚀 Starting optimized build process...')
  
  for (let attempt = 1; attempt <= RETRY_COUNT + 1; attempt++) {
    try {
      await buildWithTimeout(attempt)
      console.log('🎉 Build completed successfully!')
      process.exit(0)
    } catch (error) {
      console.error(`❌ Build attempt ${attempt} failed:`, error.message)
      
      if (attempt <= RETRY_COUNT) {
        console.log(`🔄 Retrying in 10 seconds... (${attempt}/${RETRY_COUNT})`)
        await new Promise(resolve => setTimeout(resolve, 10000))
      } else {
        console.error('💥 All build attempts failed!')
        
        // Provide troubleshooting information
        console.log('\n🔧 Troubleshooting steps:')
        console.log('1. Check network connectivity')
        console.log('2. Clear node_modules and reinstall: rm -rf node_modules && npm install')
        console.log('3. Clear Next.js cache: rm -rf .next')
        console.log('4. Try building with: DISABLE_WALLET_CONNECT_DURING_BUILD=true npm run build')
        console.log('5. Check for any hanging processes: ps aux | grep node')
        
        process.exit(1)
      }
    }
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n🛑 Build interrupted by user')
  process.exit(1)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Build terminated')
  process.exit(1)
})

main().catch((error) => {
  console.error('💥 Unexpected error:', error)
  process.exit(1)
})