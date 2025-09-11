import { ReactNode, useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import ConnectionStatus from './ConnectionStatus'
import useDynamicViewport from '@/hooks/useDynamicViewport'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { vh, vw, isMobile, isTablet } = useDynamicViewport()

  // Optimize layout based on device
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Add device-specific optimizations
    const rootElement = document.documentElement
    
    if (isMobile) {
      rootElement.classList.add('mobile-optimized')
      // Disable pull-to-refresh on mobile
      document.body.style.overscrollBehavior = 'none'
    } else {
      rootElement.classList.remove('mobile-optimized')
      document.body.style.overscrollBehavior = 'auto'
    }

    if (isTablet) {
      rootElement.classList.add('tablet-optimized')
    } else {
      rootElement.classList.remove('tablet-optimized')
    }
  }, [isMobile, isTablet])

  return (
    <div className="min-h-screen mobile-full-height w-full flex flex-col bg-deep-black">
      <Header />
      <div className="flex-1 w-full main-container">
        {children}
      </div>
      <Footer />
      <ConnectionStatus />
      
      {/* Development viewport info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-2 right-2 bg-black/80 text-white text-xs p-2 rounded z-50">
          {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'} | {Math.round(vw * 100)}x{Math.round(vh * 100)}
        </div>
      )}
    </div>
  )
}