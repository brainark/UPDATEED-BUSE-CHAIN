import { createConfig } from 'wagmi'
import { http } from 'viem'
import { mainnet, polygon, optimism, arbitrum, bsc, sepolia } from 'wagmi/chains'
import { Chain } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

// Define BrainArk chain configuration
export const brainarkChain: Chain = {
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
      webSocket: ['wss://rpc.brainark.online'],
    },
    public: {
      http: ['https://rpc.brainark.online'],
      webSocket: ['wss://rpc.brainark.online'],
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

// Singleton WalletConnect instance prevention
let walletConnectInstance: any = null

const getWalletConnectConnector = () => {
  if (walletConnectInstance) {
    return walletConnectInstance
  }

  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 
                   process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 
                   '138029c5ee4c7a8ecfbe38fddcca1818'

  walletConnectInstance = walletConnect({ 
    projectId,
    metadata: {
      name: 'BrainArk DApp',
      description: 'BrainArk Besu Chain DApp - The Future of Decentralized Intelligence',
      url: 'https://dapp.brainark.online',
      icons: ['https://brainark.online/favicon.ico']
    },
    showQrModal: true,
    qrModalOptions: {
      themeMode: 'dark',
    }
  })

  return walletConnectInstance
}

export const wagmiConfigSimple = createConfig({
  chains: [
    brainarkChain, // Primary chain first
    mainnet,
    bsc,
    polygon,
    optimism,
    arbitrum,
    ...(process.env.NODE_ENV === 'development' ? [sepolia] : []),
  ],
  connectors: [
    injected(),
    getWalletConnectConnector(),
    coinbaseWallet({
      appName: 'BrainArk DApp',
      appLogoUrl: 'https://brainark.online/favicon.ico',
      preference: 'smartWalletOnly',
      version: '4',
    }),
  ],
  transports: {
    [brainarkChain.id]: http('https://rpc.brainark.online', {
      timeout: 15_000,
      retryCount: 3,
      retryDelay: 2_000,
    }),
    [mainnet.id]: http('https://eth.llamarpc.com', {
      timeout: 10_000,
      retryCount: 2,
    }),
    [bsc.id]: http('https://bsc-dataseed1.binance.org', {
      timeout: 10_000,
      retryCount: 2,
    }),
    [polygon.id]: http('https://polygon-rpc.com', {
      timeout: 10_000,
      retryCount: 2,
    }),
    [optimism.id]: http('https://mainnet.optimism.io', {
      timeout: 10_000,
      retryCount: 2,
    }),
    [arbitrum.id]: http('https://arb1.arbitrum.io/rpc', {
      timeout: 10_000,
      retryCount: 2,
    }),
    [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com', {
      timeout: 10_000,
      retryCount: 2,
    }),
  },
  ssr: false,
})

export default wagmiConfigSimple