import { useEffect, useState, useCallback } from 'react'

interface ViewportDimensions {
  vw: number
  vh: number
  innerWidth: number
  innerHeight: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: 'portrait' | 'landscape'
}

export function useDynamicViewport(): ViewportDimensions {
  const [dimensions, setDimensions] = useState<ViewportDimensions>({
    vw: 0,
    vh: 0,
    innerWidth: 0,
    innerHeight: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    orientation: 'portrait'
  })

  const updateViewport = useCallback(() => {
    if (typeof window === 'undefined') return

    const { innerWidth, innerHeight } = window
    
    const vw = innerWidth * 0.01
    const vh = innerHeight * 0.01
    const isMobile = innerWidth < 768
    const isTablet = innerWidth >= 768 && innerWidth < 1024
    const isDesktop = innerWidth >= 1024
    const orientation = innerWidth > innerHeight ? 'landscape' : 'portrait'

    setDimensions({
      vw,
      vh,
      innerWidth,
      innerHeight,
      isMobile,
      isTablet,
      isDesktop,
      orientation
    })

    // Update CSS custom properties
    document.documentElement.style.setProperty('--vw', `${vw}px`)
    document.documentElement.style.setProperty('--vh', `${vh}px`)
    document.documentElement.style.setProperty('--inner-width', `${innerWidth}px`)
    document.documentElement.style.setProperty('--inner-height', `${innerHeight}px`)
    
    // Add device type classes
    document.documentElement.classList.remove('is-mobile', 'is-tablet', 'is-desktop')
    if (isMobile) document.documentElement.classList.add('is-mobile')
    if (isTablet) document.documentElement.classList.add('is-tablet')
    if (isDesktop) document.documentElement.classList.add('is-desktop')
  }, [])

  useEffect(() => {
    updateViewport()

    let timeoutId: NodeJS.Timeout
    const debouncedUpdate = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateViewport, 100)
    }

    window.addEventListener('resize', debouncedUpdate)
    window.addEventListener('orientationchange', () => {
      // Delay to account for browser UI changes
      setTimeout(updateViewport, 150)
    })

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', debouncedUpdate)
      window.removeEventListener('orientationchange', updateViewport)
    }
  }, [updateViewport])

  return dimensions
}

export default useDynamicViewport