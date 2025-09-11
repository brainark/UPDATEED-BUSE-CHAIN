import { useEffect, useState, useCallback } from 'react'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  interactionReady: boolean
  networkType: string | undefined
  deviceMemory: number | undefined
  cpuClass: number | undefined
  isSlowDevice: boolean
  isSlowNetwork: boolean
  shouldLoadHeavyComponents: boolean
}

export function usePerformance(): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    interactionReady: false,
    networkType: undefined,
    deviceMemory: undefined,
    cpuClass: undefined,
    isSlowDevice: false,
    isSlowNetwork: false,
    shouldLoadHeavyComponents: true
  })

  const measurePerformance = useCallback(() => {
    if (typeof window === 'undefined') return

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const loadTime = navigation?.loadEventEnd - navigation?.navigationStart || 0
    const renderTime = navigation?.domContentLoadedEventEnd - navigation?.navigationStart || 0

    // @ts-ignore - These are experimental APIs
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    const networkType = connection?.effectiveType
    const deviceMemory = (navigator as any)?.deviceMemory
    const cpuClass = (navigator as any)?.hardwareConcurrency

    // Determine if device/network is slow
    const isSlowNetwork = networkType === 'slow-2g' || networkType === '2g' || connection?.saveData
    const isSlowDevice = deviceMemory ? deviceMemory < 4 : cpuClass < 4
    const shouldLoadHeavyComponents = !isSlowDevice && !isSlowNetwork

    setMetrics({
      loadTime,
      renderTime,
      interactionReady: true,
      networkType,
      deviceMemory,
      cpuClass,
      isSlowDevice,
      isSlowNetwork,
      shouldLoadHeavyComponents
    })
  }, [])

  useEffect(() => {
    // Measure performance after page load
    if (document.readyState === 'complete') {
      measurePerformance()
    } else {
      window.addEventListener('load', measurePerformance)
      return () => window.removeEventListener('load', measurePerformance)
    }
  }, [measurePerformance])

  return metrics
}

// Hook for progressive loading based on performance
export function useProgressiveLoading() {
  const { isSlowDevice, isSlowNetwork, shouldLoadHeavyComponents } = usePerformance()
  const [componentsLoaded, setComponentsLoaded] = useState(0)
  
  const loadNextComponent = useCallback(() => {
    setComponentsLoaded(prev => prev + 1)
  }, [])

  const shouldLoadComponent = useCallback((priority: 'high' | 'medium' | 'low') => {
    if (!shouldLoadHeavyComponents && priority === 'low') return false
    if (isSlowNetwork && priority !== 'high') return componentsLoaded < 2
    return true
  }, [shouldLoadHeavyComponents, isSlowNetwork, componentsLoaded])

  return {
    isSlowDevice,
    isSlowNetwork,
    shouldLoadHeavyComponents,
    componentsLoaded,
    loadNextComponent,
    shouldLoadComponent
  }
}

export default usePerformance