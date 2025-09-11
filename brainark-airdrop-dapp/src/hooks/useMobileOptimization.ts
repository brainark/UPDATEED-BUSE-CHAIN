import { useEffect, useState, useCallback } from 'react'

interface MobileOptimizationOptions {
  enablePerformanceMode: boolean
  enableReducedMotion: boolean
  enableDataSaver: boolean
  connectionType: string
  deviceMemory: number
  isLowEndDevice: boolean
}

const useMobileOptimization = () => {
  const [optimization, setOptimization] = useState<MobileOptimizationOptions>({
    enablePerformanceMode: false,
    enableReducedMotion: false,
    enableDataSaver: false,
    connectionType: 'unknown',
    deviceMemory: 4,
    isLowEndDevice: false
  })

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    if (typeof window !== 'undefined') {
      // Detect device capabilities
      const navigator = window.navigator as any
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
      
      // Get device memory (GB)
      const deviceMemory = navigator.deviceMemory || 4
      
      // Detect connection type
      const connectionType = connection?.effectiveType || 'unknown'
      
      // Check for reduced motion preference
      const enableReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      
      // Determine if it's a low-end device
      const isLowEndDevice = deviceMemory <= 2 || 
                            connectionType === 'slow-2g' || 
                            connectionType === '2g'
      
      // Enable performance mode for low-end devices or slow connections
      const enablePerformanceMode = isLowEndDevice || 
                                   connectionType === 'slow-2g' || 
                                   connectionType === '2g' ||
                                   enableReducedMotion

      // Enable data saver for slow connections
      const enableDataSaver = connectionType === 'slow-2g' || 
                             connectionType === '2g' ||
                             connection?.saveData === true

      setOptimization({
        enablePerformanceMode,
        enableReducedMotion,
        enableDataSaver,
        connectionType,
        deviceMemory,
        isLowEndDevice
      })

      // Apply performance optimizations to document
      if (enablePerformanceMode) {
        document.documentElement.classList.add('performance-mode')
      }

      if (enableReducedMotion) {
        document.documentElement.classList.add('reduce-motion')
      }

      // Monitor connection changes
      if (connection) {
        const handleConnectionChange = () => {
          const newConnectionType = connection.effectiveType || 'unknown'
          const newDataSaver = connection.saveData === true
          
          setOptimization(prev => ({
            ...prev,
            connectionType: newConnectionType,
            enableDataSaver: newDataSaver || newConnectionType === 'slow-2g' || newConnectionType === '2g'
          }))
        }

        connection.addEventListener('change', handleConnectionChange)
        return () => connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [])

  // Debounced scroll optimization
  const useOptimizedScroll = useCallback((callback: () => void, delay: number = 16) => {
    let timeoutId: NodeJS.Timeout
    
    return () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(callback, optimization.enablePerformanceMode ? delay * 2 : delay)
    }
  }, [optimization.enablePerformanceMode])

  // Image loading optimization
  const getOptimizedImageProps = useCallback((src: string, alt: string) => {
    return {
      src,
      alt,
      loading: 'lazy' as const,
      decoding: 'async' as const,
      ...(optimization.enableDataSaver && {
        // Use smaller images for data saver mode
        sizes: '(max-width: 768px) 50vw, 25vw'
      })
    }
  }, [optimization.enableDataSaver])

  // Animation optimization
  const getAnimationConfig = useCallback(() => {
    if (optimization.enableReducedMotion) {
      return {
        duration: 0,
        transition: { duration: 0 }
      }
    }
    
    if (optimization.enablePerformanceMode) {
      return {
        duration: 0.2,
        transition: { duration: 0.2, ease: 'linear' }
      }
    }
    
    return {
      duration: 0.3,
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  }, [optimization.enableReducedMotion, optimization.enablePerformanceMode])

  return {
    ...optimization,
    isClient,
    useOptimizedScroll,
    getOptimizedImageProps,
    getAnimationConfig
  }
}

export default useMobileOptimization