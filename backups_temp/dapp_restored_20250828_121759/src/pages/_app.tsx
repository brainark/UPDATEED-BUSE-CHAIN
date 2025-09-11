import '@/styles/globals.css'
import '@/App.css'
import '@/styles/layout-fixes.css'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { Toaster } from 'react-hot-toast'
import { wagmiConfig } from '@/utils/wagmiConfig'
import WalletStatus from '@/components/WalletStatus'
import { useState, useEffect } from 'react'
import MobileResponsiveLayout from '@/components/MobileResponsiveLayout'
import { ShaderSettingsProvider } from '@/components/shaders'

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

  useEffect(() => {
    setMounted(true)
    
    // Check for dark mode preference
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(darkMode)

    // Suppress external service errors and warnings (both dev and production)
    const originalError = console.error
    const originalWarn = console.warn
    
    console.error = (...args) => {
      const message = args[0]?.toString() || ''
      if (
        message.includes('WebSocket connection closed') ||
        message.includes('Unauthorized: invalid key') ||
        message.includes('WalletConnect') ||
        message.includes('projectId') ||
        message.includes('Failed to load resource') ||
        message.includes('explorer-api.walletconnect.com') ||
        message.includes('cca-lite.coinbase.com') ||
        message.includes('Analytics SDK') ||
        message.includes('TypeError: Failed to fetch') ||
        message.includes('net::ERR_CONNECTION_TIMED_OUT') ||
        message.includes('ERR_NETWORK') ||
        message.includes('ERR_INTERNET_DISCONNECTED') ||
        message.includes('wallet_requestPermissions') ||
        message.includes('already pending') ||
        message.includes('Connection failed')
      ) {
        // Suppress these errors
        return
      }
      originalError.apply(console, args)
    }

    console.warn = (...args) => {
      const message = args[0]?.toString() || ''
      if (
        message.includes('WalletConnect') ||
        message.includes('projectId') ||
        message.includes('Lit is in dev mode') ||
        message.includes('MetaMask - RPC Error') ||
        message.includes('wallet_requestPermissions') ||
        message.includes('already pending')
      ) {
        // Suppress these warnings
        return
      }
      originalWarn.apply(console, args)
    }

    // Block problematic external requests at the network level
    if (typeof window !== 'undefined' && window.fetch) {
      const originalFetch = window.fetch
      window.fetch = (...args) => {
        const url = args[0]?.toString() || ''
        if (
          url.includes('cca-lite.coinbase.com') ||
          url.includes('coinbase.com/metrics') ||
          url.includes('coinbase.com/amp')
        ) {
          // Return a resolved promise to prevent errors
          return Promise.resolve(new Response('{}', { status: 200 }))
        }
        return originalFetch.apply(window, args)
      }
    }
  }, [])

  if (!mounted) return null

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ShaderSettingsProvider>
          <MobileResponsiveLayout>
            <Component {...pageProps} />
            <WalletStatus />
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