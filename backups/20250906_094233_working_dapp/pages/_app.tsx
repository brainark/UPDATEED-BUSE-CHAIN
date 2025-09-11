import '@/styles/globals.css'
import '@/styles/mobile-performance.css'
import '@/App.css'
import '@/styles/layout-fixes.css'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { Toaster } from 'react-hot-toast'
import { enhancedWagmiConfig } from '@/utils/enhancedWagmiConfig'
import WalletStatus from '@/components/WalletStatus'
import { useState, useEffect } from 'react'
import MobileResponsiveLayout from '@/components/MobileResponsiveLayout'
import { ShaderSettingsProvider } from '@/components/shaders'
import useMobileOptimization from '@/hooks/useMobileOptimization'
import { networkErrorHandler } from '@/utils/networkErrorHandler'
import NetworkStatusMonitor from '@/components/NetworkStatusMonitor'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)
  
  // Mobile performance optimizations
  const { enablePerformanceMode, isClient } = useMobileOptimization()

  useEffect(() => {
    setMounted(true)
    
    // Initialize network error handler
    console.log('🚀 Initializing enhanced network error handler...')
    
    // Check for dark mode preference
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(darkMode)

    // The networkErrorHandler is automatically initialized when imported
    // It handles all the error suppression and request blocking
    
    // Additional cleanup for any remaining issues
    const cleanup = () => {
      // Clear any pending retries on page unload
      networkErrorHandler.clearRetries()
    }

    window.addEventListener('beforeunload', cleanup)
    
    return () => {
      window.removeEventListener('beforeunload', cleanup)
    }
  }, [])

  if (!mounted) return null

  return (
    <WagmiProvider config={enhancedWagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ShaderSettingsProvider>
          <MobileResponsiveLayout>
            <Component {...pageProps} />
            <WalletStatus />
            <NetworkStatusMonitor />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: isDark ? '#1F2937' : '#ffffff',
                  color: isDark ? '#ffffff' : '#000000',
                  border: '1px solid',
                  borderColor: isDark ? '#374151' : '#E5E7EB',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
          </MobileResponsiveLayout>
        </ShaderSettingsProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}