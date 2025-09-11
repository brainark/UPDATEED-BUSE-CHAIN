// Build-time optimized Wagmi configuration
import { createConfig } from 'wagmi'
import { http } from 'viem'
import { mainnet, polygon, bsc } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// Simplified chain configuration for build time
export const brainarkChainSimple = {
  id: 424242,
  name: 'BrainArk Network',
  nativeCurrency: {
    name: 'BrainArk Native Coin',
    symbol: 'BAK',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.brainark.online'],
    },
    public: {
      http: ['https://rpc.brainark.online'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BrainArk Explorer',
      url: 'https://explorer.brainark.online',
    },
  },
  testnet: false,
}

// Build-time safe wagmi configuration
export const buildTimeWagmiConfig = createConfig({
  chains: [
    brainarkChainSimple as any,
    mainnet,
    bsc,
    polygon,
  ],
  connectors: [
    // Only use injected connector during build to avoid network issues
    injected({
      target: 'metaMask',
    }),
  ],
  transports: {
    [brainarkChainSimple.id]: http('https://rpc.brainark.online', {
      timeout: 5000, // Shorter timeout for build
      retryCount: 1, // Fewer retries for build
    }),
    [mainnet.id]: http('https://eth.llamarpc.com', {
      timeout: 5000,
      retryCount: 1,
    }),
    [bsc.id]: http('https://bsc-dataseed1.binance.org', {
      timeout: 5000,
      retryCount: 1,
    }),
    [polygon.id]: http('https://polygon-rpc.com', {
      timeout: 5000,
      retryCount: 1,
    }),
  },
  ssr: true, // Enable SSR for build
  batch: {
    multicall: false, // Disable multicall during build
  },
})

// Runtime detection helper
export const isBuildTime = (): boolean => {
  return typeof window === 'undefined' && process.env.NODE_ENV === 'production'
}

// Runtime detection helper
export const isServerSide = (): boolean => {
  return typeof window === 'undefined'
}

export default buildTimeWagmiConfig