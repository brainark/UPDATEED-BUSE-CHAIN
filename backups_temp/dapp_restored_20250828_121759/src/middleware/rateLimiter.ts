/**
 * Rate Limiting Middleware for API Security
 * Prevents abuse and spam attacks on API endpoints
 */

import { NextApiRequest, NextApiResponse } from 'next'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Custom error message
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore: RateLimitStore = {}

/**
 * Creates a rate limiting middleware
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const key = getClientKey(req)
    const now = Date.now()
    
    // Clean up expired entries
    cleanupExpiredEntries(now)
    
    // Get or create rate limit entry
    let entry = rateLimitStore[key]
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs
      }
      rateLimitStore[key] = entry
    }
    
    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
      const resetTimeSeconds = Math.ceil((entry.resetTime - now) / 1000)
      
      res.status(429).json({
        error: 'Too Many Requests',
        message: config.message || 'Rate limit exceeded. Please try again later.',
        retryAfter: resetTimeSeconds,
        limit: config.maxRequests,
        windowMs: config.windowMs
      })
      return
    }
    
    // Increment counter
    entry.count++
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', config.maxRequests)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - entry.count))
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000))
    
    // Continue to next middleware/handler
    next()
  }
}

/**
 * Get unique client identifier for rate limiting
 */
function getClientKey(req: NextApiRequest): string {
  // Try to get real IP address
  const forwarded = req.headers['x-forwarded-for']
  const ip = typeof forwarded === 'string' 
    ? forwarded.split(',')[0].trim()
    : req.socket.remoteAddress || 'unknown'
  
  // Include user agent for additional uniqueness
  const userAgent = req.headers['user-agent'] || 'unknown'
  const userAgentHash = simpleHash(userAgent)
  
  return `${ip}:${userAgentHash}`
}

/**
 * Simple hash function for user agent
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(now: number): void {
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key]
    }
  })
}

/**
 * Predefined rate limit configurations
 */
export const RateLimitConfigs = {
  // Strict rate limiting for sensitive operations
  STRICT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many requests. Please wait 15 minutes before trying again.'
  },
  
  // Moderate rate limiting for API calls
  MODERATE: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 20,
    message: 'Too many requests. Please wait 5 minutes before trying again.'
  },
  
  // Lenient rate limiting for general use
  LENIENT: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'Too many requests. Please wait 1 minute before trying again.'
  },
  
  // Social media verification specific
  SOCIAL_VERIFICATION: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 3,
    message: 'Too many verification attempts. Please wait 10 minutes before trying again.'
  }
}

/**
 * Wrapper function to apply rate limiting to API handlers
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void
) {
  const rateLimiter = createRateLimiter(config)
  
  return async (req: NextApiRequest, res: NextApiResponse) => {
    return new Promise<void>((resolve, reject) => {
      rateLimiter(req, res, async () => {
        try {
          await handler(req, res)
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    })
  }
}

/**
 * Advanced rate limiting with different limits per endpoint
 */
export class AdvancedRateLimiter {
  private configs: Map<string, RateLimitConfig> = new Map()
  
  addEndpoint(path: string, config: RateLimitConfig) {
    this.configs.set(path, config)
  }
  
  middleware() {
    return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
      const path = req.url?.split('?')[0] || ''
      const config = this.configs.get(path)
      
      if (!config) {
        // No rate limiting configured for this endpoint
        next()
        return
      }
      
      const rateLimiter = createRateLimiter(config)
      await rateLimiter(req, res, next)
    }
  }
}

/**
 * IP-based blocking for malicious actors
 */
export class IPBlocker {
  private blockedIPs: Set<string> = new Set()
  private suspiciousActivity: Map<string, number> = new Map()
  
  blockIP(ip: string, duration?: number) {
    this.blockedIPs.add(ip)
    
    if (duration) {
      setTimeout(() => {
        this.blockedIPs.delete(ip)
      }, duration)
    }
  }
  
  isBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip)
  }
  
  reportSuspiciousActivity(ip: string) {
    const current = this.suspiciousActivity.get(ip) || 0
    this.suspiciousActivity.set(ip, current + 1)
    
    // Auto-block after 5 suspicious activities
    if (current + 1 >= 5) {
      this.blockIP(ip, 24 * 60 * 60 * 1000) // Block for 24 hours
    }
  }
  
  middleware() {
    return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
      const ip = getClientKey(req).split(':')[0]
      
      if (this.isBlocked(ip)) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Your IP address has been blocked due to suspicious activity.'
        })
        return
      }
      
      next()
    }
  }
}

// Global instances
export const globalIPBlocker = new IPBlocker()
export const globalRateLimiter = new AdvancedRateLimiter()

// Configure rate limits for different endpoints
globalRateLimiter.addEndpoint('/api/verify-twitter-follow', RateLimitConfigs.SOCIAL_VERIFICATION)
globalRateLimiter.addEndpoint('/api/verify-twitter-engagement', RateLimitConfigs.SOCIAL_VERIFICATION)
globalRateLimiter.addEndpoint('/api/verify-telegram-membership', RateLimitConfigs.SOCIAL_VERIFICATION)
globalRateLimiter.addEndpoint('/api/stats', RateLimitConfigs.MODERATE)
globalRateLimiter.addEndpoint('/api/referral', RateLimitConfigs.MODERATE)