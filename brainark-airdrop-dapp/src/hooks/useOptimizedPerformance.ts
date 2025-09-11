import { useEffect, useRef, useCallback, useState } from 'react'

// Performance optimization hook for production deployment
export const useOptimizedPerformance = () => {
  const [isProductionMode, setIsProductionMode] = useState(false)
  const intervalRefs = useRef<NodeJS.Timeout[]>([])

  useEffect(() => {
    // Check if we're in production mode
    const prodMode = process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MODE === 'true'
    setIsProductionMode(prodMode)
  }, [])

  // Optimized interval management
  const createOptimizedInterval = useCallback((
    callback: () => void, 
    delay: number,
    immediate = false
  ) => {
    if (immediate) callback()
    
    const interval = setInterval(callback, delay)
    intervalRefs.current.push(interval)
    
    return interval
  }, [])

  // Clear all intervals on unmount
  const clearAllIntervals = useCallback(() => {
    intervalRefs.current.forEach(clearInterval)
    intervalRefs.current = []
  }, [])

  useEffect(() => {
    return clearAllIntervals
  }, [clearAllIntervals])

  return {
    isProductionMode,
    createOptimizedInterval,
    clearAllIntervals,
    // Optimized delays for production
    delays: {
      priceUpdate: isProductionMode ? 60000 : 30000, // 1 min in prod, 30s in dev
      contractStats: isProductionMode ? 45000 : 15000, // 45s in prod, 15s in dev  
      liquidityCheck: isProductionMode ? 120000 : 60000, // 2 min in prod, 1 min in dev
      apiPolling: isProductionMode ? 30000 : 10000 // 30s in prod, 10s in dev
    }
  }
}

// Debounced state hook to prevent excessive re-renders
export const useDebouncedState = <T>(initialValue: T, delay: number = 300) => {
  const [value, setValue] = useState<T>(initialValue)
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay])

  return [debouncedValue, setValue] as const
}

// Memory optimization hook
export const useMemoryOptimization = () => {
  const cache = useRef(new Map())

  const memoize = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string
  ): T => {
    return ((...args: Parameters<T>) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
      
      if (cache.current.has(key)) {
        return cache.current.get(key)
      }

      const result = fn(...args)
      cache.current.set(key, result)
      
      // Limit cache size to prevent memory leaks
      if (cache.current.size > 100) {
        const firstKey = cache.current.keys().next().value
        cache.current.delete(firstKey)
      }
      
      return result
    }) as T
  }, [])

  const clearCache = useCallback(() => {
    cache.current.clear()
  }, [])

  return { memoize, clearCache }
}