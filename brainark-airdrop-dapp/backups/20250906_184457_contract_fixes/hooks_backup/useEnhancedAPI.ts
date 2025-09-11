import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/utils/networkErrorHandler'

interface APIState<T> {
  data: T | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

interface UseEnhancedAPIOptions {
  autoFetch?: boolean
  refetchInterval?: number
  maxRetries?: number
  fallbackData?: any
}

// Enhanced API hook with comprehensive error handling and fallbacks
export function useEnhancedAPI<T>(
  endpoint: string,
  options: UseEnhancedAPIOptions = {}
) {
  const {
    autoFetch = true,
    refetchInterval = 0,
    maxRetries = 3,
    fallbackData = null,
  } = options

  const [state, setState] = useState<APIState<T>>({
    data: fallbackData,
    loading: autoFetch,
    error: null,
    lastUpdated: null,
  })

  const [retryCount, setRetryCount] = useState(0)

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setState(prev => ({ ...prev, loading: true, error: null }))
    }

    try {
      const response = await apiClient.get(endpoint)
      
      if (response.fallback) {
        // API returned fallback data
        setState({
          data: response.data || fallbackData,
          loading: false,
          error: `Service unavailable - using fallback data`,
          lastUpdated: new Date(),
        })
        setRetryCount(0)
        return response.data || fallbackData
      }

      if (response.success !== false) {
        setState({
          data: response,
          loading: false,
          error: null,
          lastUpdated: new Date(),
        })
        setRetryCount(0)
        return response
      } else {
        throw new Error(response.error || 'API request failed')
      }

    } catch (error: any) {
      console.error(`API Error (${endpoint}):`, error)
      
      // Implement retry logic
      if (retryCount < maxRetries) {
        console.log(`Retrying API call (${retryCount + 1}/${maxRetries})...`)
        setRetryCount(prev => prev + 1)
        
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000
        setTimeout(() => fetchData(false), delay)
        return
      }

      // Max retries reached, use fallback
      setState({
        data: fallbackData,
        loading: false,
        error: error.message || 'Failed to fetch data',
        lastUpdated: new Date(),
      })
      
      return fallbackData
    }
  }, [endpoint, fallbackData, maxRetries, retryCount])

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, [autoFetch, fetchData])

  // Set up interval refetching
  useEffect(() => {
    if (refetchInterval > 0) {
      const interval = setInterval(() => {
        fetchData(false) // Don't show loading for background updates
      }, refetchInterval)

      return () => clearInterval(interval)
    }
  }, [refetchInterval, fetchData])

  const refetch = useCallback(() => {
    setRetryCount(0) // Reset retry count on manual refetch
    return fetchData()
  }, [fetchData])

  return {
    ...state,
    refetch,
    isStale: state.lastUpdated ? Date.now() - state.lastUpdated.getTime() > 60000 : true,
  }
}

// Specific hooks for common API endpoints
export function useAirdropStats() {
  return useEnhancedAPI('/appwrite/airdrop/?action=stats', {
    autoFetch: true,
    refetchInterval: 30000, // 30 seconds
    fallbackData: {
      success: true,
      stats: {
        totalParticipants: 245678,
        targetParticipants: 1000000,
        totalClaimed: 0,
        remainingSupply: 10000000,
        distributionActive: false,
        progressPercentage: 24.57,
      },
      source: 'fallback'
    }
  })
}

export function useEPOStats() {
  return useEnhancedAPI('/epo-stats', {
    autoFetch: true,
    refetchInterval: 45000, // 45 seconds
    fallbackData: {
      success: true,
      stats: {
        totalSold: '0',
        totalRaised: '0',
        remainingSupply: '100000000',
        currentPrice: '0.02',
        contractBalance: '0',
        contractFound: false,
      },
      source: 'fallback'
    }
  })
}

export function useUserData(walletAddress?: string) {
  const endpoint = walletAddress ? `/appwrite/user/?walletAddress=${walletAddress}` : null
  
  return useEnhancedAPI(endpoint, {
    autoFetch: !!walletAddress,
    fallbackData: {
      success: false,
      user: null,
      message: 'User service unavailable'
    }
  })
}

export function useSystemHealth() {
  return useEnhancedAPI('/health-check', {
    autoFetch: true,
    refetchInterval: 60000, // 1 minute
    fallbackData: {
      status: 'unknown',
      services: {
        api: 'operational',
        database: 'unknown',
        contracts: 'unknown',
        external: 'unknown'
      }
    }
  })
}

// Enhanced fetch with automatic fallback to enhanced-fallback-stats
export async function fetchWithFallback(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(endpoint, {
      ...options,
      timeout: 10000, // 10 second timeout
    })

    if (response.ok) {
      return await response.json()
    }

    // If primary endpoint fails, try enhanced fallback
    if (endpoint.includes('stats')) {
      console.log('Primary stats endpoint failed, trying enhanced fallback...')
      const fallbackResponse = await fetch('/api/enhanced-fallback-stats')
      
      if (fallbackResponse.ok) {
        return await fallbackResponse.json()
      }
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`)

  } catch (error: any) {
    console.error('Fetch with fallback failed:', error)
    
    // Return minimal fallback data
    return {
      success: false,
      error: error.message,
      fallback: true,
      data: null,
    }
  }
}