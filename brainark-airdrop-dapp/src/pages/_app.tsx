import '@/styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiConfig } from 'wagmi'
import { RainbowKitProvider, darkTheme, lightTheme, connectorsForWallets } from '@rainbow-me/rainbowkit'
import { metaMaskWallet, injectedWallet } from '@rainbow-me/rainbowkit/wallets'
import { Toaster } from 'react-hot-toast'
import { simpleWagmiConfig, chains } from '@/utils/simpleWagmi'
import { useState, useEffect } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

// Create simple connectors without WalletConnect
const connectors = connectorsForWallets([
  {
    groupName: 'Popular',
    wallets: [
      metaMaskWallet({ projectId: '', chains }),
      injectedWallet({ chains }),
    ],
  },
])

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check for dark mode preference
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(darkMode)

    // Suppress WalletConnect and WebSocket errors in development
    if (process.env.NODE_ENV === 'development') {
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
          message.includes('explorer-api.walletconnect.com')
        ) {
          // Suppress these errors in development
          return
        }
        originalError.apply(console, args)
      }

      console.warn = (...args) => {
        const message = args[0]?.toString() || ''
        if (
          message.includes('WalletConnect') ||
          message.includes('projectId') ||
          message.includes('Lit is in dev mode')
        ) {
          // Suppress these warnings in development
          return
        }
        originalWarn.apply(console, args)
      }
    }
  }, [])

  if (!mounted) return null

  return (
    <WagmiConfig config={simpleWagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          chains={chains}
          theme={isDark ? darkTheme() : lightTheme()}
          appInfo={{
            appName: 'BrainArk Airdrop DApp',
            learnMoreUrl: 'https://brainark.online',
          }}
          modalSize="compact"
          showRecentTransactions={true}
        >
          <div className="min-h-screen bg-deep-black">
            <Component {...pageProps} />
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
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  )
}