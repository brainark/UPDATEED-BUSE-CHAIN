import { useState, useEffect } from 'react'

interface MobileLayoutProps {
  children: React.ReactNode
}

export default function MobileResponsiveLayout({ children }: MobileLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
      setViewportHeight(height)
      
      // Set CSS custom properties for viewport units
      document.documentElement.style.setProperty('--vh', `${height * 0.01}px`)
      document.documentElement.style.setProperty('--vw', `${width * 0.01}px`)
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    window.addEventListener('orientationchange', () => {
      // Delay to account for orientation change
      setTimeout(checkDevice, 100)
    })
    
    return () => {
      window.removeEventListener('resize', checkDevice)
      window.removeEventListener('orientationchange', checkDevice)
    }
  }, [])

  const layoutClasses = `
    min-h-screen 
    ${isMobile ? 'mobile-layout' : isTablet ? 'tablet-layout' : 'desktop-layout'}
    bg-deep-black 
    overflow-x-hidden
  `

  return (
    <div className={layoutClasses}>
      <style jsx>{`
        .mobile-layout {
          font-size: 16px;
          line-height: 1.6;
        }
        
        .mobile-layout .hero-section {
          padding: 1rem;
          min-height: calc(var(--vh, 1vh) * 100);
        }
        
        .mobile-layout .card-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
          padding: 0 1rem;
        }
        
        .mobile-layout .button-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
          padding: 0 1rem;
        }
        
        .tablet-layout {
          font-size: 16px;
          line-height: 1.6;
        }
        
        .tablet-layout .card-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          padding: 0 1.5rem;
        }
        
        .desktop-layout {
          font-size: 18px;
          line-height: 1.7;
        }
        
        .desktop-layout .card-grid {
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          padding: 0;
        }
        
        /* Touch-friendly buttons on mobile */
        @media (max-width: 768px) {
          button {
            min-height: 48px;
            padding: 12px 16px;
            font-size: 16px;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }
          
          input, select, textarea {
            font-size: 16px; /* Prevent zoom on iOS */
            min-height: 44px;
          }
        }
        
        /* Improve scrolling on iOS */
        .mobile-layout {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
        
        /* Fix viewport units for mobile browsers */
        .full-height {
          min-height: calc(var(--vh, 1vh) * 100);
        }
        
        .section-padding {
          padding: ${isMobile ? '1rem' : isTablet ? '1.5rem' : '2rem'};
        }
      `}</style>
      {children}
    </div>
  )
}
