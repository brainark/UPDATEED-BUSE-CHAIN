// Optimized EPO Contract Hook for High-Performance Trading
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { usePublicClient, useWalletClient } from 'wagmi'
import { parseAbi, formatEther } from 'viem'

interface EPOContractStats {
  totalSold: string;
  totalRaised: string;
  remainingSupply: string;
  price: string;
  contractBalance: string;
}

interface EPOContractData {
  stats: EPOContractStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Connection pool for contract calls
class ContractConnectionPool {
  private static instance: ContractConnectionPool
  private pool: Map<string, any> = new Map()
  private lastUpdate = 0
  private readonly UPDATE_INTERVAL = 10000 // 10 seconds

  static getInstance(): ContractConnectionPool {
    if (!ContractConnectionPool.instance) {
      ContractConnectionPool.instance = new ContractConnectionPool()
    }
    return ContractConnectionPool.instance
  }

  async getContractData(contractAddress: string, publicClient: any): Promise<EPOContractStats | null> {
    const now = Date.now()
    const cacheKey = `${contractAddress}_stats`
    
    // Return cached data if recent
    if (this.pool.has(cacheKey) && (now - this.lastUpdate) < this.UPDATE_INTERVAL) {
      return this.pool.get(cacheKey)
    }

    try {
      // EPO ABI (minimal for performance)
      const EPO_ABI = parseAbi([
        'function getContractStats() view returns (uint256 totalSold, uint256 totalRaised, uint256 remainingSupply, uint256 price, uint256 contractBalance)',
        'function currentPrice() view returns (uint256)',
        'function totalBakSold() view returns (uint256)',
        'function TOTAL_BAK_FOR_SALE() view returns (uint256)',
      ])

      // Check contract existence (cached)
      const contractKey = `${contractAddress}_exists`
      if (!this.pool.has(contractKey)) {
        const code = await publicClient.getBytecode({ address: contractAddress })
        const exists = code && code !== '0x'
        this.pool.set(contractKey, exists)
        if (!exists) {
          throw new Error('Contract not found')
        }
      }

      // Try optimized getContractStats first
      try {
        const result = await publicClient.readContract({
          address: contractAddress,
          abi: EPO_ABI,
          functionName: 'getContractStats',
        })

        const [totalSold, totalRaised, remainingSupply, price, contractBalance] = result as [bigint, bigint, bigint, bigint, bigint]

        const stats: EPOContractStats = {
          totalSold: formatEther(totalSold),
          totalRaised: formatEther(totalRaised),
          remainingSupply: formatEther(remainingSupply),
          price: formatEther(price),
          contractBalance: formatEther(contractBalance),
        }

        // Cache the result
        this.pool.set(cacheKey, stats)
        this.lastUpdate = now
        return stats

      } catch (contractError) {
        // Fallback to individual calls (cached results)
        const [currentPrice, totalBakSold, totalSupply, balance] = await Promise.all([
          publicClient.readContract({
            address: contractAddress,
            abi: EPO_ABI,
            functionName: 'currentPrice',
          }).catch(() => BigInt(20000000000000000)),

          publicClient.readContract({
            address: contractAddress,
            abi: EPO_ABI,
            functionName: 'totalBakSold',
          }).catch(() => BigInt(0)),

          publicClient.readContract({
            address: contractAddress,
            abi: EPO_ABI,
            functionName: 'TOTAL_BAK_FOR_SALE',
          }).catch(() => BigInt(100000000000000000000000000)),

          publicClient.getBalance({ address: contractAddress }),
        ])

        const remainingSupply = totalSupply - totalBakSold

        const stats: EPOContractStats = {
          totalSold: formatEther(totalBakSold),
          totalRaised: '0',
          remainingSupply: formatEther(remainingSupply),
          price: formatEther(currentPrice),
          contractBalance: formatEther(balance),
        }

        this.pool.set(cacheKey, stats)
        this.lastUpdate = now
        return stats
      }

    } catch (error: any) {
      console.error('Contract data fetch failed:', error)
      return null
    }
  }

  // Clear cache when needed
  clearCache(contractAddress?: string) {
    if (contractAddress) {
      this.pool.delete(`${contractAddress}_stats`)
      this.pool.delete(`${contractAddress}_exists`)
    } else {
      this.pool.clear()
    }
    this.lastUpdate = 0
  }
}

// Transaction queue for handling high-volume requests
class TransactionQueue {
  private static instance: TransactionQueue
  private queue: Array<{ id: string; promise: Promise<any>; resolve: any; reject: any }> = []
  private processing = false
  private readonly MAX_CONCURRENT = 5

  static getInstance(): TransactionQueue {
    if (!TransactionQueue.instance) {
      TransactionQueue.instance = new TransactionQueue()
    }
    return TransactionQueue.instance
  }

  async addTransaction(txFunction: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = Date.now().toString() + Math.random().toString(36)
      const promise = txFunction()
      
      this.queue.push({ id, promise, resolve, reject })
      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return
    
    this.processing = true
    
    try {
      // Process transactions in batches
      const batch = this.queue.splice(0, this.MAX_CONCURRENT)
      
      const results = await Promise.allSettled(
        batch.map(async (item) => {
          try {
            const result = await item.promise
            item.resolve(result)
            return result
          } catch (error) {
            item.reject(error)
            throw error
          }
        })
      )
      
      console.log(`Processed batch of ${batch.length} transactions`)
      
    } finally {
      this.processing = false
      
      // Continue processing if more transactions are queued
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 100)
      }
    }
  }
}

export const useOptimizedEPOContract = (contractAddress?: string) => {
  const [data, setData] = useState<EPOContractData>({
    stats: null,
    isLoading: true,
    error: null,
    refetch: async () => {}
  })

  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  
  // Connection pool and transaction queue instances
  const connectionPool = useMemo(() => ContractConnectionPool.getInstance(), [])
  const transactionQueue = useMemo(() => TransactionQueue.getInstance(), [])
  
  // Refs for preventing memory leaks
  const isMountedRef = useRef(true)
  const lastFetchRef = useRef(0)

  const epoAddress = useMemo(() => 
    (contractAddress || process.env.NEXT_PUBLIC_EPO_CONTRACT || '0xdE04886D4e89f48F73c1684f2e610b25D561DD48') as `0x${string}`,
    [contractAddress]
  )

  // Optimized contract data fetching
  const fetchContractStats = useCallback(async (force = false) => {
    if (!publicClient || !isMountedRef.current) return

    const now = Date.now()
    // Prevent too frequent calls (debouncing)
    if (!force && (now - lastFetchRef.current) < 5000) return
    
    lastFetchRef.current = now

    try {
      if (isMountedRef.current) {
        setData(prev => ({ ...prev, isLoading: true, error: null }))
      }

      const stats = await connectionPool.getContractData(epoAddress, publicClient)
      
      if (isMountedRef.current) {
        setData(prev => ({ 
          ...prev, 
          stats, 
          isLoading: false, 
          error: stats ? null : 'Failed to fetch contract data'
        }))
      }

    } catch (error: any) {
      console.error('Error fetching EPO contract stats:', error)
      if (isMountedRef.current) {
        setData(prev => ({
          ...prev,
          error: error.message || 'Failed to fetch contract data',
          isLoading: false
        }))
      }
    }
  }, [publicClient, epoAddress, connectionPool])

  // Optimized purchase function with queue management
  const purchaseBAK = useCallback(async (paymentAmount: string): Promise<string> => {
    if (!walletClient || !walletClient.account) {
      throw new Error('Wallet not connected')
    }

    return transactionQueue.addTransaction(async () => {
      try {
        // Fix BigInt conversion for decimal numbers
        const cleanAmount = Math.floor(parseFloat(paymentAmount)).toString()
        const amountBigInt = BigInt(cleanAmount)
        
        const hash = await walletClient.sendTransaction({
          account: walletClient.account!,
          to: epoAddress,
          value: amountBigInt,
          gas: 200000n,
        })

        // Clear cache after successful transaction
        connectionPool.clearCache(epoAddress)
        
        // Delayed refetch to allow blockchain to update
        setTimeout(() => {
          if (isMountedRef.current) {
            fetchContractStats(true)
          }
        }, 2000)

        return hash
      } catch (error: any) {
        console.error('Purchase failed:', error)
        throw new Error(error.message || 'Purchase transaction failed')
      }
    })
  }, [walletClient, epoAddress, transactionQueue, connectionPool, fetchContractStats])

  // Initial data fetch with optimized timing
  useEffect(() => {
    isMountedRef.current = true
    fetchContractStats()

    // Set up periodic refresh (less frequent for performance)
    const interval = setInterval(() => {
      if (isMountedRef.current) {
        fetchContractStats()
      }
    }, 30000) // 30 seconds instead of constant polling

    return () => {
      isMountedRef.current = false
      clearInterval(interval)
    }
  }, [fetchContractStats])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return {
    ...data,
    refetch: fetchContractStats,
    purchaseBAK,
    contractAddress: epoAddress,
  }
}