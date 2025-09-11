// Enhanced Error Handler for BrainArk DApp
// Handles network timeouts, RPC failures, and connection issues

export interface ErrorHandlerConfig {
  maxRetries: number
  retryDelay: number
  fallbackRpcUrls: Record<number, string[]>
  timeoutMs: number
}

export const DEFAULT_ERROR_CONFIG: ErrorHandlerConfig = {
  maxRetries: 3,
  retryDelay: 2000,
  fallbackRpcUrls: {
    1: ['https://ethereum-rpc.publicnode.com', 'https://rpc.ankr.com/eth', 'https://eth.llamarpc.com'],
    56: ['https://bsc-rpc.publicnode.com', 'https://bsc-dataseed1.binance.org'],
    137: ['https://polygon-bor-rpc.publicnode.com', 'https://polygon-rpc.com'],
    424242: ['https://rpc.brainark.online']
  },
  timeoutMs: 15000
}

export class NetworkErrorHandler {
  private config: ErrorHandlerConfig
  private rpcFailures: Record<string, number> = {}
  
  constructor(config?: Partial<ErrorHandlerConfig>) {
    this.config = { ...DEFAULT_ERROR_CONFIG, ...config }
  }

  async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    chainId?: number
  ): Promise<T> {
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        console.log(`[${operationName}] Attempt ${attempt + 1}/${this.config.maxRetries + 1}`)
        
        const result = await this.withTimeout(operation(), this.config.timeoutMs)
        
        // Reset failure count on success
        if (chainId) {
          this.resetFailureCount(chainId.toString())
        }
        
        return result
      } catch (error: any) {
        lastError = error
        
        // Track RPC failures
        if (chainId) {
          this.trackFailure(chainId.toString())
        }
        
        console.warn(`[${operationName}] Attempt ${attempt + 1} failed:`, error.message)
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          console.error(`[${operationName}] Non-retryable error, stopping:`, error.message)
          break
        }
        
        // Wait before retry (unless last attempt)
        if (attempt < this.config.maxRetries) {
          await this.delay(this.config.retryDelay * (attempt + 1))
        }
      }
    }
    
    throw new Error(`${operationName} failed after ${this.config.maxRetries + 1} attempts: ${lastError?.message}`)
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
      )
    ])
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private isNonRetryableError(error: any): boolean {
    const message = error.message?.toLowerCase() || ''
    
    // Don't retry on user rejections or invalid parameters
    if (message.includes('user rejected') || 
        message.includes('user denied') ||
        message.includes('invalid parameter') ||
        message.includes('method not found') ||
        error.code === 4001 ||
        error.code === 4100) {
      return true
    }
    
    return false
  }

  private trackFailure(rpcUrl: string): void {
    this.rpcFailures[rpcUrl] = (this.rpcFailures[rpcUrl] || 0) + 1
  }

  private resetFailureCount(rpcUrl: string): void {
    this.rpcFailures[rpcUrl] = 0
  }

  getFailureCount(rpcUrl: string): number {
    return this.rpcFailures[rpcUrl] || 0
  }

  getBestRpcUrl(chainId: number): string | null {
    const urls = this.config.fallbackRpcUrls[chainId]
    if (!urls || urls.length === 0) return null
    
    // Find URL with lowest failure count
    let bestUrl = urls[0]
    let lowestFailures = this.getFailureCount(bestUrl)
    
    for (const url of urls) {
      const failures = this.getFailureCount(url)
      if (failures < lowestFailures) {
        bestUrl = url
        lowestFailures = failures
      }
    }
    
    return bestUrl
  }

  // Coinbase Wallet specific error suppression
  suppressCoinbaseErrors(): void {
    const originalError = console.error
    console.error = (...args: any[]) => {
      const message = args.join(' ').toLowerCase()
      
      // Suppress known Coinbase wallet timeout errors
      if (message.includes('cca-lite.coinbase.com') ||
          message.includes('coinbase wallet timeout') ||
          message.includes('smartwallet') ||
          message.includes('connection_timed_out')) {
        return // Silently ignore these errors
      }
      
      originalError.apply(console, args)
    }
  }

  // Treasury address validation with proper fallbacks
  validateTreasuryAddress(tokenSymbol: string, networkName: string, contractAddress: string): boolean {
    // Known valid contract addresses
    const validContracts: Record<string, string> = {
      'USDC_ethereum': '0xA0b86a33E6441E02aaBBD88816953560998637e7',
      'USDT_ethereum': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      'USDC_bsc': '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      'USDT_bsc': '0x55d398326f99059fF775485246999027B3197955',
      'USDC_polygon': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      'USDT_polygon': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
    }

    const key = `${tokenSymbol}_${networkName}`
    const expectedAddress = validContracts[key]
    
    if (expectedAddress && contractAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
      console.warn(`Treasury address validation failed for ${key}:`, {
        provided: contractAddress,
        expected: expectedAddress
      })
      return false
    }
    
    return true
  }
}

// Global error handler instance
export const errorHandler = new NetworkErrorHandler()

// Initialize error suppression for common issues
if (typeof window !== 'undefined') {
  errorHandler.suppressCoinbaseErrors()
}

// Export utility functions
export const withRetry = errorHandler.withRetry.bind(errorHandler)
export const getBestRpcUrl = errorHandler.getBestRpcUrl.bind(errorHandler)
export const validateTreasuryAddress = errorHandler.validateTreasuryAddress.bind(errorHandler)