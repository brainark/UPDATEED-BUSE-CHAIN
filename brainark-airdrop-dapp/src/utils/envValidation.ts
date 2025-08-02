/**
 * Environment Variable Validation and Security Utilities
 * Ensures all required environment variables are properly configured
 */

interface EnvironmentConfig {
  NODE_ENV: string
  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID?: string
  TELEGRAM_BOT_TOKEN?: string
  TWITTER_CLIENT_ID?: string
  TWITTER_CLIENT_SECRET?: string
  TWITTER_BEARER_TOKEN?: string
  NEXTAUTH_SECRET?: string
  NEXT_PUBLIC_RPC_URL?: string
  NEXT_PUBLIC_CHAIN_ID?: string
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  environment: 'development' | 'production' | 'test'
}

/**
 * Validates environment variables for security and completeness
 */
export function validateEnvironment(): ValidationResult {
  const env = process.env as EnvironmentConfig
  const errors: string[] = []
  const warnings: string[] = []
  
  // Determine environment
  const environment = env.NODE_ENV === 'production' ? 'production' : 
                     env.NODE_ENV === 'test' ? 'test' : 'development'

  // Critical security checks
  if (environment === 'production') {
    // Production environment must have all secrets configured
    if (!env.NEXTAUTH_SECRET || env.NEXTAUTH_SECRET === 'your_nextauth_secret') {
      errors.push('NEXTAUTH_SECRET must be set to a secure random value in production')
    }
    
    if (!env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN.includes('your_telegram')) {
      warnings.push('TELEGRAM_BOT_TOKEN not configured - social verification will use mock mode')
    }
    
    if (!env.TWITTER_BEARER_TOKEN || env.TWITTER_BEARER_TOKEN.includes('your_twitter')) {
      warnings.push('TWITTER_BEARER_TOKEN not configured - social verification will use mock mode')
    }
    
    // Check for placeholder values that should never be in production
    const placeholderPatterns = [
      'your_',
      'placeholder',
      'example',
      'test_',
      'dummy'
    ]
    
    Object.entries(env).forEach(([key, value]) => {
      if (typeof value === 'string' && placeholderPatterns.some(pattern => 
        value.toLowerCase().includes(pattern))) {
        errors.push(`${key} contains placeholder value in production: ${value}`)
      }
    })
  }

  // Validate required environment variables
  const requiredForProduction = [
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_RPC_URL',
    'NEXT_PUBLIC_CHAIN_ID'
  ]

  if (environment === 'production') {
    requiredForProduction.forEach(key => {
      if (!env[key as keyof EnvironmentConfig]) {
        errors.push(`Required environment variable ${key} is missing`)
      }
    })
  }

  // Validate format of specific variables
  if (env.NEXT_PUBLIC_CHAIN_ID && isNaN(Number(env.NEXT_PUBLIC_CHAIN_ID))) {
    errors.push('NEXT_PUBLIC_CHAIN_ID must be a valid number')
  }

  if (env.NEXT_PUBLIC_RPC_URL && !isValidUrl(env.NEXT_PUBLIC_RPC_URL)) {
    errors.push('NEXT_PUBLIC_RPC_URL must be a valid URL')
  }

  // Security warnings
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_BOT_TOKEN.length < 40) {
    warnings.push('TELEGRAM_BOT_TOKEN appears to be invalid (too short)')
  }

  if (env.TWITTER_BEARER_TOKEN && env.TWITTER_BEARER_TOKEN.length < 50) {
    warnings.push('TWITTER_BEARER_TOKEN appears to be invalid (too short)')
  }

  // Check for common security issues
  if (typeof window !== 'undefined') {
    // Client-side checks
    const clientEnvVars = Object.keys(env).filter(key => key.startsWith('NEXT_PUBLIC_'))
    clientEnvVars.forEach(key => {
      const value = env[key as keyof EnvironmentConfig]
      if (value && (value.includes('secret') || value.includes('private'))) {
        errors.push(`${key} appears to contain sensitive data but is exposed to client`)
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    environment
  }
}

/**
 * Validates if a string is a valid URL
 */
function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

/**
 * Sanitizes environment variables for logging (removes sensitive data)
 */
export function sanitizeEnvForLogging(env: Record<string, any>): Record<string, any> {
  const sensitiveKeys = [
    'secret',
    'token',
    'key',
    'password',
    'private'
  ]

  const sanitized: Record<string, any> = {}

  Object.entries(env).forEach(([key, value]) => {
    const isSensitive = sensitiveKeys.some(sensitive => 
      key.toLowerCase().includes(sensitive))
    
    if (isSensitive && value) {
      sanitized[key] = `${value.substring(0, 4)}****${value.substring(value.length - 4)}`
    } else {
      sanitized[key] = value
    }
  })

  return sanitized
}

/**
 * Gets environment configuration with validation
 */
export function getSecureEnvironmentConfig() {
  const validation = validateEnvironment()
  
  if (!validation.isValid) {
    console.error('Environment validation failed:', validation.errors)
    if (validation.environment === 'production') {
      throw new Error('Critical environment validation errors in production')
    }
  }

  if (validation.warnings.length > 0) {
    console.warn('Environment validation warnings:', validation.warnings)
  }

  return {
    validation,
    config: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      IS_PRODUCTION: validation.environment === 'production',
      IS_DEVELOPMENT: validation.environment === 'development',
      HAS_TWITTER_API: !!(process.env.TWITTER_BEARER_TOKEN && 
                         !process.env.TWITTER_BEARER_TOKEN.includes('your_')),
      HAS_TELEGRAM_API: !!(process.env.TELEGRAM_BOT_TOKEN && 
                          !process.env.TELEGRAM_BOT_TOKEN.includes('your_')),
      WALLET_CONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
      RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545',
      CHAIN_ID: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 1337,
    }
  }
}

/**
 * Runtime environment validation for critical operations
 */
export function validateForCriticalOperation(operation: string): void {
  const validation = validateEnvironment()
  
  if (!validation.isValid && validation.environment === 'production') {
    throw new Error(`Cannot perform ${operation} - environment validation failed: ${validation.errors.join(', ')}`)
  }
}