// Treasury Liquidity Tracker for $1M Lock System
import { PAYMENT_TOKENS, getTokenPrice, fetchTokenPrices, getAllTreasuryAddresses, NETWORKS } from './multiNetworkConfig'
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

export class LiquidityTracker {
  private static instance: LiquidityTracker
  private cache: LiquiditySnapshot | null = null
  private lastFetch = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private readonly REQUEST_TIMEOUT = 30000 // 30 seconds timeout for blockchain calls

  static getInstance(): LiquidityTracker {
    if (!LiquidityTracker.instance) {
      LiquidityTracker.instance = new LiquidityTracker()
    }
    return LiquidityTracker.instance
  }

  // Fetch real treasury balances from blockchain networks
  private async fetchTreasuryBalance(treasuryAddress: string, tokenSymbol: string, networkName: string): Promise<number> {
    try {
      const publicClient = this.getPublicClient(networkName)
      if (!publicClient) {
        console.warn(`No public client available for network: ${networkName}`)
        return 0
      }

      // Validate treasury address format
      if (!treasuryAddress || treasuryAddress.length !== 42 || !treasuryAddress.startsWith('0x')) {
        console.warn(`Invalid treasury address format: ${treasuryAddress}`)
        return 0
      }

      // Get token config for this specific token and network
      const tokenConfig = PAYMENT_TOKENS.find(token => 
        token.symbol === tokenSymbol && 
        token.network === networkName && 
        token.treasuryAddress.toLowerCase() === treasuryAddress.toLowerCase()
      )

      if (!tokenConfig) {
        console.warn(`Token config not found for ${tokenSymbol} on ${networkName}`)
        return 0
      }

      // Validate contract address format for ERC20 tokens
      if (tokenConfig.contractAddress !== '0x0000000000000000000000000000000000000000' && 
          (!tokenConfig.contractAddress || tokenConfig.contractAddress.length !== 42 || !tokenConfig.contractAddress.startsWith('0x'))) {
        console.warn(`Invalid contract address format: ${tokenConfig.contractAddress}`)
        return 0
      }

      let balance: bigint

      if (tokenConfig.contractAddress === '0x0000000000000000000000000000000000000000') {
        // Native token (ETH, BNB, MATIC)
        balance = await publicClient.getBalance({ 
          address: treasuryAddress as Address 
        })
      } else {
        // ERC20 token (USDT, USDC)
        const erc20Abi = parseAbi([
          'function balanceOf(address account) view returns (uint256)'
        ])
        
        balance = await publicClient.readContract({
          address: tokenConfig.contractAddress as Address,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [treasuryAddress as Address]
        })
      }

      // Convert balance based on token decimals
      const balanceFormatted = tokenConfig.decimals === 18 
        ? parseFloat(formatEther(balance))
        : parseFloat(balance.toString()) / Math.pow(10, tokenConfig.decimals)

      return balanceFormatted

    } catch (error: any) {
      console.error(`Error fetching balance for ${treasuryAddress} (${tokenSymbol} on ${networkName}):`, error)
      // Return 0 on error to avoid breaking the entire liquidity calculation
      return 0
    }
  }

  // Get public client for different networks
  private getPublicClient(networkName: string) {
    const rpcUrl = this.getRpcUrl(networkName)
    if (!rpcUrl) return null

    try {
      const transportOptions = {
        timeout: 30000, // 30 second timeout
        retryCount: 2,
        retryDelay: 2000
      }

      switch (networkName) {
        case 'ethereum':
          return createPublicClient({ 
            chain: mainnet, 
            transport: http(rpcUrl, transportOptions)
          })
        case 'bsc':
          return createPublicClient({ 
            chain: bsc, 
            transport: http(rpcUrl, transportOptions)
          })
        case 'polygon':
          return createPublicClient({ 
            chain: polygon, 
            transport: http(rpcUrl, transportOptions)
          })
        default:
          console.warn(`Unsupported network: ${networkName}`)
          return null
      }
    } catch (error) {
      console.error(`Error creating public client for ${networkName}:`, error)
      return null
    }
  }

  // Get RPC URL for network
  private getRpcUrl(networkName: string): string | null {
    const network = NETWORKS[networkName]
    if (!network) return null
    
    // Use environment variables or fallback to default
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

  async getCurrentLiquiditySnapshot(): Promise<LiquiditySnapshot> {
    const now = Date.now()
    
    // Return cached data if still valid
    if (this.cache && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cache
    }

    try {
      const balancesByNetwork: Record<string, TreasuryBalance[]> = {}
      let totalUsdValue = 0
      let successfulFetches = 0
      let totalFetches = 0

      // Fetch balances with timeout and parallel processing
      const balancePromises = PAYMENT_TOKENS.map(async (token) => {
        try {
          totalFetches++
          
          // Add timeout to prevent hanging requests
          const balancePromise = this.fetchTreasuryBalance(
            token.treasuryAddress, 
            token.symbol, 
            token.network
          )
          
          const timeoutPromise = new Promise<number>((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), this.REQUEST_TIMEOUT)
          )
          
          const balance = await Promise.race([balancePromise, timeoutPromise])
          successfulFetches++
          
          const tokenPrice = getTokenPrice(token.symbol)
          const usdValue = balance * tokenPrice

          const treasuryBalance: TreasuryBalance = {
            networkName: token.network,
            tokenSymbol: token.symbol,
            balance,
            usdValue,
            treasuryAddress: token.treasuryAddress
          }

          if (!balancesByNetwork[token.network]) {
            balancesByNetwork[token.network] = []
          }
          balancesByNetwork[token.network].push(treasuryBalance)

          totalUsdValue += usdValue
          
          return treasuryBalance
        } catch (error) {
          console.warn(`Failed to fetch balance for ${token.symbol} on ${token.network}:`, error)
          
          // Return zero balance for failed requests
          const treasuryBalance: TreasuryBalance = {
            networkName: token.network,
            tokenSymbol: token.symbol,
            balance: 0,
            usdValue: 0,
            treasuryAddress: token.treasuryAddress
          }
          
          if (!balancesByNetwork[token.network]) {
            balancesByNetwork[token.network] = []
          }
          balancesByNetwork[token.network].push(treasuryBalance)
          
          return treasuryBalance
        }
      })

      // Fetch latest token prices before calculating USD values
      await fetchTokenPrices()
      
      // Wait for all balance fetches to complete
      await Promise.all(balancePromises)

      const liquidityLockActive = totalUsdValue < LIQUIDITY_LOCK_THRESHOLD
      const progressPercentage = Math.min((totalUsdValue / LIQUIDITY_LOCK_THRESHOLD) * 100, 100)

      this.cache = {
        totalUsdValue,
        liquidityLockActive,
        progressPercentage,
        balancesByNetwork,
        lastUpdated: new Date()
      }

      this.lastFetch = now
      
      // Log success rate for monitoring
      console.log(`Liquidity fetch completed: ${successfulFetches}/${totalFetches} successful requests. Total liquidity: $${totalUsdValue.toFixed(2)}`)
      
      return this.cache

    } catch (error) {
      console.error('Error fetching liquidity snapshot:', error)
      
      // Return safe defaults on error
      return {
        totalUsdValue: 0,
        liquidityLockActive: true,
        progressPercentage: 0,
        balancesByNetwork: {},
        lastUpdated: new Date()
      }
    }
  }

  // Get formatted liquidity status for UI display
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
    
    // Estimate time based on current daily volume (rough estimate)
    const dailyVolume = 10000 // Estimated daily EPO volume
    const daysToUnlock = remaining > 0 ? Math.ceil(remaining / dailyVolume) : 0
    const timeEstimate = daysToUnlock > 0 ? 
      `~${daysToUnlock} days` : 
      'Unlocked'

    return {
      canSell,
      totalLiquidity,
      remainingToUnlock,
      progressPercentage: snapshot.progressPercentage,
      timeEstimate
    }
  }

  // Check if user can sell (for transaction validation)
  async canUserSell(): Promise<{ allowed: boolean; reason?: string }> {
    const snapshot = await this.getCurrentLiquiditySnapshot()
    
    if (snapshot.liquidityLockActive) {
      const remaining = LIQUIDITY_LOCK_THRESHOLD - snapshot.totalUsdValue
      return {
        allowed: false,
        reason: `Selling is locked until treasury reaches $1M. Current: $${snapshot.totalUsdValue.toLocaleString()}, Remaining: $${remaining.toLocaleString()}`
      }
    }
    
    return { allowed: true }
  }

  // Force refresh cache (useful for testing or after major transactions)
  async refreshLiquidityData(): Promise<LiquiditySnapshot> {
    this.cache = null
    this.lastFetch = 0
    return await this.getCurrentLiquiditySnapshot()
  }

  // Get detailed breakdown by network for admin dashboard
  async getDetailedBreakdown(): Promise<{
    byNetwork: Record<string, { total: number; tokens: TreasuryBalance[] }>
    topContributors: TreasuryBalance[]
    recentGrowth: number
  }> {
    const snapshot = await this.getCurrentLiquiditySnapshot()
    
    const byNetwork: Record<string, { total: number; tokens: TreasuryBalance[] }> = {}
    const allBalances: TreasuryBalance[] = []
    
    for (const [network, balances] of Object.entries(snapshot.balancesByNetwork)) {
      const total = balances.reduce((sum, b) => sum + b.usdValue, 0)
      byNetwork[network] = { total, tokens: balances }
      allBalances.push(...balances)
    }
    
    // Sort by USD value for top contributors
    const topContributors = allBalances
      .sort((a, b) => b.usdValue - a.usdValue)
      .slice(0, 10)
    
    // Calculate recent growth (simplified - in production, compare with historical data)
    const recentGrowth = Math.min((snapshot.progressPercentage / 100) * 10, 15) // Growth correlates with progress
    
    return {
      byNetwork,
      topContributors,
      recentGrowth
    }
  }
}

// Export singleton instance
export const liquidityTracker = LiquidityTracker.getInstance()

// Helper functions for components
export async function checkSellPermission(): Promise<boolean> {
  const result = await liquidityTracker.canUserSell()
  return result.allowed
}

export async function getLiquidityProgress(): Promise<number> {
  const snapshot = await liquidityTracker.getCurrentLiquiditySnapshot()
  return snapshot.progressPercentage
}

export async function getTotalLiquidityUSD(): Promise<number> {
  const snapshot = await liquidityTracker.getCurrentLiquiditySnapshot()
  return snapshot.totalUsdValue
}

export default liquidityTracker