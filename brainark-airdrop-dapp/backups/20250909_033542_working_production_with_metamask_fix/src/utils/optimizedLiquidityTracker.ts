// Optimized Treasury Liquidity Tracker for High-Performance Trading
import { PAYMENT_TOKENS, getTokenPrice, fetchTokenPrices, NETWORKS } from './multiNetworkConfig'
import { createPublicClient, http, formatEther, parseAbi, Address } from 'viem'
import { mainnet, bsc, polygon } from 'viem/chains'

export interface TreasuryBalance {
  networkName: string
  tokenSymbol: string
  balance: number
  usdValue: number
  treasuryAddress: string
}

export interface LiquiditySnapshot {
  totalUsdValue: number
  liquidityLockActive: boolean
  progressPercentage: number
  balancesByNetwork: Record<string, TreasuryBalance[]>
  lastUpdated: Date
}

export const LIQUIDITY_LOCK_THRESHOLD = 1000000 // $1,000,000 USD

// High-performance client pool with connection reuse
class ClientPool {
  private static instance: ClientPool
  private clients: Map<string, any> = new Map()
  private readonly CLIENT_TIMEOUT = 10000 // 10 seconds

  static getInstance(): ClientPool {
    if (!ClientPool.instance) {
      ClientPool.instance = new ClientPool()
    }
    return ClientPool.instance
  }

  getClient(networkName: string) {
    if (this.clients.has(networkName)) {
      return this.clients.get(networkName)
    }

    const client = this.createClient(networkName)
    if (client) {
      this.clients.set(networkName, client)
    }
    return client
  }

  private createClient(networkName: string) {
    const rpcUrl = this.getRpcUrl(networkName)
    if (!rpcUrl) return null

    try {
      const transport = http(rpcUrl, {
        timeout: 5000, // 5 second timeout
        retryCount: 1, // Only 1 retry
        retryDelay: 500 // 500ms delay
      })

      switch (networkName) {
        case 'ethereum':
          return createPublicClient({ chain: mainnet, transport })
        case 'bsc':
          return createPublicClient({ chain: bsc, transport })
        case 'polygon':
          return createPublicClient({ chain: polygon, transport })
        default:
          return null
      }
    } catch (error) {
      console.error(`Failed to create client for ${networkName}:`, error)
      return null
    }
  }

  private getRpcUrl(networkName: string): string | null {
    const network = NETWORKS[networkName]
    if (!network) return null
    
    switch (networkName) {
      case 'ethereum':
        return process.env.ETHEREUM_RPC_URL || network.rpcUrl
      case 'bsc':
        return process.env.BSC_RPC_URL || network.rpcUrl
      case 'polygon':
        return process.env.POLYGON_RPC_URL || network.rpcUrl
      default:
        return network.rpcUrl
    }
  }

  // Clear clients on network issues
  clearClient(networkName: string) {
    this.clients.delete(networkName)
  }
}

// High-performance caching with intelligent invalidation
class LiquidityCache {
  private static instance: LiquidityCache
  private cache = new Map<string, { data: any; timestamp: number; hits: number }>()
  private readonly CACHE_DURATION = 2 * 60 * 1000 // 2 minutes for high-frequency trading
  private readonly MAX_CACHE_SIZE = 100

  static getInstance(): LiquidityCache {
    if (!LiquidityCache.instance) {
      LiquidityCache.instance = new LiquidityCache()
    }
    return LiquidityCache.instance
  }

  get(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key)
      return null
    }

    // Update hit counter for LRU
    cached.hits++
    return cached.data
  }

  set(key: string, data: any) {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const lruKey = this.getLRUKey()
      if (lruKey) {
        this.cache.delete(lruKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 1
    })
  }

  private getLRUKey(): string | null {
    let lruKey: string | null = null
    let minHits = Infinity

    for (const [key, entry] of this.cache) {
      if (entry.hits < minHits) {
        minHits = entry.hits
        lruKey = key
      }
    }

    return lruKey
  }

  invalidate(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }
}

export class OptimizedLiquidityTracker {
  private static instance: OptimizedLiquidityTracker
  private clientPool: ClientPool
  private cache: LiquidityCache
  private readonly REQUEST_TIMEOUT = 5000 // 5 seconds
  private readonly MAX_CONCURRENT_REQUESTS = 10

  private constructor() {
    this.clientPool = ClientPool.getInstance()
    this.cache = LiquidityCache.getInstance()
  }

  static getInstance(): OptimizedLiquidityTracker {
    if (!OptimizedLiquidityTracker.instance) {
      OptimizedLiquidityTracker.instance = new OptimizedLiquidityTracker()
    }
    return OptimizedLiquidityTracker.instance
  }

  // High-performance balance fetching with connection pooling
  private async fetchTreasuryBalance(
    treasuryAddress: string, 
    tokenSymbol: string, 
    networkName: string
  ): Promise<number> {
    const cacheKey = `${networkName}_${tokenSymbol}_${treasuryAddress}`
    const cached = this.cache.get(cacheKey)
    if (cached !== null) {
      return cached
    }

    try {
      const client = this.clientPool.getClient(networkName)
      if (!client) {
        console.warn(`No client available for ${networkName}`)
        return 0
      }

      const tokenConfig = PAYMENT_TOKENS.find(token => 
        token.symbol === tokenSymbol && 
        token.network === networkName && 
        token.treasuryAddress.toLowerCase() === treasuryAddress.toLowerCase()
      )

      if (!tokenConfig) {
        return 0
      }

      let balance: bigint

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), this.REQUEST_TIMEOUT)
      )

      if (tokenConfig.contractAddress === '0x0000000000000000000000000000000000000000') {
        // Native token balance
        balance = await Promise.race([
          client.getBalance({ address: treasuryAddress as Address }),
          timeoutPromise
        ])
      } else {
        // ERC20 token balance
        const erc20Abi = parseAbi(['function balanceOf(address) view returns (uint256)'])
        
        balance = await Promise.race([
          client.readContract({
            address: tokenConfig.contractAddress as Address,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [treasuryAddress as Address]
          }),
          timeoutPromise
        ])
      }

      // Convert balance based on decimals
      const balanceFormatted = tokenConfig.decimals === 18 
        ? parseFloat(formatEther(balance))
        : parseFloat(balance.toString()) / Math.pow(10, tokenConfig.decimals)

      // Cache the result
      this.cache.set(cacheKey, balanceFormatted)
      return balanceFormatted

    } catch (error: any) {
      console.error(`Balance fetch failed for ${treasuryAddress}:`, error.message)
      
      // Clear client on network errors
      if (error.message.includes('timeout') || error.message.includes('network')) {
        this.clientPool.clearClient(networkName)
      }
      
      return 0
    }
  }

  // Optimized liquidity snapshot with batching and parallelization
  async getCurrentLiquiditySnapshot(): Promise<LiquiditySnapshot> {
    const cacheKey = 'liquidity_snapshot'
    const cached = this.cache.get(cacheKey)
    if (cached) {
      return cached
    }

    try {
      // Fetch fresh token prices first (cached internally)
      await fetchTokenPrices()

      const balancesByNetwork: Record<string, TreasuryBalance[]> = {}
      let totalUsdValue = 0
      
      // Group tokens by network for efficient batching
      const tokensByNetwork = PAYMENT_TOKENS.reduce((acc, token) => {
        if (!acc[token.network]) {
          acc[token.network] = []
        }
        acc[token.network].push(token)
        return acc
      }, {} as Record<string, typeof PAYMENT_TOKENS>)

      // Process networks in parallel with concurrency limit
      const networkPromises = Object.entries(tokensByNetwork).map(async ([networkName, tokens]) => {
        // Process tokens in batches to avoid overwhelming the network
        const batchSize = Math.min(this.MAX_CONCURRENT_REQUESTS, tokens.length)
        const tokenBatches: typeof tokens[] = []
        
        for (let i = 0; i < tokens.length; i += batchSize) {
          tokenBatches.push(tokens.slice(i, i + batchSize))
        }

        const networkBalances: TreasuryBalance[] = []

        for (const batch of tokenBatches) {
          const batchPromises = batch.map(async (token) => {
            try {
              const balance = await this.fetchTreasuryBalance(
                token.treasuryAddress,
                token.symbol,
                token.network
              )

              const tokenPrice = getTokenPrice(token.symbol)
              const usdValue = balance * tokenPrice

              return {
                networkName: token.network,
                tokenSymbol: token.symbol,
                balance,
                usdValue,
                treasuryAddress: token.treasuryAddress
              } as TreasuryBalance
            } catch (error) {
              console.warn(`Failed to process ${token.symbol} on ${token.network}`)
              return {
                networkName: token.network,
                tokenSymbol: token.symbol,
                balance: 0,
                usdValue: 0,
                treasuryAddress: token.treasuryAddress
              } as TreasuryBalance
            }
          })

          const batchResults = await Promise.all(batchPromises)
          networkBalances.push(...batchResults)
          
          // Small delay between batches to prevent rate limiting
          if (tokenBatches.length > 1) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        }

        return { networkName, balances: networkBalances }
      })

      // Wait for all networks to complete
      const networkResults = await Promise.all(networkPromises)

      // Aggregate results
      for (const { networkName, balances } of networkResults) {
        balancesByNetwork[networkName] = balances
        totalUsdValue += balances.reduce((sum, b) => sum + b.usdValue, 0)
      }

      const liquidityLockActive = totalUsdValue < LIQUIDITY_LOCK_THRESHOLD
      const progressPercentage = Math.min((totalUsdValue / LIQUIDITY_LOCK_THRESHOLD) * 100, 100)

      const snapshot: LiquiditySnapshot = {
        totalUsdValue,
        liquidityLockActive,
        progressPercentage,
        balancesByNetwork,
        lastUpdated: new Date()
      }

      // Cache the result
      this.cache.set(cacheKey, snapshot)
      
      console.log(`Liquidity snapshot updated: $${totalUsdValue.toFixed(2)} (${progressPercentage.toFixed(1)}%)`)
      
      return snapshot

    } catch (error) {
      console.error('Error fetching optimized liquidity snapshot:', error)
      
      // Return safe defaults
      return {
        totalUsdValue: 0,
        liquidityLockActive: true,
        progressPercentage: 0,
        balancesByNetwork: {},
        lastUpdated: new Date()
      }
    }
  }

  // Fast liquidity status for UI (heavily cached)
  async getLiquidityStatus(): Promise<{
    canSell: boolean
    totalLiquidity: string
    remainingToUnlock: string
    progressPercentage: number
    timeEstimate: string
  }> {
    const snapshot = await this.getCurrentLiquiditySnapshot()
    
    const canSell = !snapshot.liquidityLockActive
    const totalLiquidity = `$${snapshot.totalUsdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    const remaining = LIQUIDITY_LOCK_THRESHOLD - snapshot.totalUsdValue
    const remainingToUnlock = remaining > 0 ? 
      `$${remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 
      '$0'
    
    // Optimistic time estimation based on recent growth
    const dailyVolume = 15000 // Estimated daily EPO volume
    const daysToUnlock = remaining > 0 ? Math.ceil(remaining / dailyVolume) : 0
    const timeEstimate = daysToUnlock > 0 ? `~${daysToUnlock} days` : 'Unlocked'

    return {
      canSell,
      totalLiquidity,
      remainingToUnlock,
      progressPercentage: snapshot.progressPercentage,
      timeEstimate
    }
  }

  // Check sell permission (optimized for high-frequency calls)
  async canUserSell(): Promise<{ allowed: boolean; reason?: string }> {
    const cacheKey = 'sell_permission'
    const cached = this.cache.get(cacheKey)
    if (cached !== null) {
      return cached
    }

    const snapshot = await this.getCurrentLiquiditySnapshot()
    
    let result: { allowed: boolean; reason?: string }
    
    if (snapshot.liquidityLockActive) {
      const remaining = LIQUIDITY_LOCK_THRESHOLD - snapshot.totalUsdValue
      result = {
        allowed: false,
        reason: `Selling locked until $1M treasury. Current: $${snapshot.totalUsdValue.toLocaleString()}, Need: $${remaining.toLocaleString()}`
      }
    } else {
      result = { allowed: true }
    }

    this.cache.set(cacheKey, result)
    return result
  }

  // Force refresh for critical updates
  async refreshLiquidityData(): Promise<LiquiditySnapshot> {
    this.cache.invalidate('liquidity')
    return await this.getCurrentLiquiditySnapshot()
  }

  // Clear all caches (for testing/debugging)
  clearAllCaches() {
    this.cache.invalidate()
  }
}

// Export singleton instance
export const optimizedLiquidityTracker = OptimizedLiquidityTracker.getInstance()

// Fast helper functions for components
export async function checkSellPermission(): Promise<boolean> {
  const result = await optimizedLiquidityTracker.canUserSell()
  return result.allowed
}

export async function getLiquidityProgress(): Promise<number> {
  const snapshot = await optimizedLiquidityTracker.getCurrentLiquiditySnapshot()
  return snapshot.progressPercentage
}

export async function getTotalLiquidityUSD(): Promise<number> {
  const snapshot = await optimizedLiquidityTracker.getCurrentLiquiditySnapshot()
  return snapshot.totalUsdValue
}

export default optimizedLiquidityTracker