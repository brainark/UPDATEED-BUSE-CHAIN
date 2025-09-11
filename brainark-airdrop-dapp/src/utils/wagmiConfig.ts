
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
  contracts: {
    // Add your contract addresses here if needed
    // multicall3: {
    //   address: '0x...',
    // },
  },
  testnet: false,
}

// Create wagmi configuration with improved wallet connector setup
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '138029c5ee4c7a8ecfbe38fddcca1818'

// Enhanced injected connector with better MetaMask detection
const createInjectedConnector = () => {
  try {
    return injected({
      target: {
        id: 'metaMask',
        name: 'MetaMask',
        provider: (window: any) => {
          // Better provider detection
          if (typeof window !== 'undefined') {
            if (window.ethereum?.isMetaMask) {
              return window.ethereum
            }
            // Handle multiple wallet providers
            if (window.ethereum?.providers) {
              const metamaskProvider = window.ethereum.providers.find((p: any) => p.isMetaMask)
              if (metamaskProvider) return metamaskProvider
            }
            // Fallback to window.ethereum
            return window.ethereum
          }
          return undefined
        }
      }
    })
  } catch (error) {
    console.warn('Failed to create injected connector:', error)
    return injected() // Fallback to default
  }
}

export const wagmiConfig = createConfig({
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
    createInjectedConnector(),
    walletConnect({ 
      projectId,
      metadata: {
        name: 'BrainArk DApp',
        description: 'BrainArk Besu Chain DApp - The Future of Decentralized Intelligence',
        url: process.env.NODE_ENV === 'production' ? 'https://dapp.brainark.online' : 'http://localhost:3000',
        icons: ['https://brainark.online/favicon.ico']
      },
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'light',
        themeVariables: {
          '--wcm-z-index': '1000'
        },
        explorerRecommendedWalletIds: [
          'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
          '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
          '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // Ledger
        ]
      }
    }),
    coinbaseWallet({
      appName: 'BrainArk DApp',
      appLogoUrl: 'https://brainark.online/favicon.ico',
      preference: 'all',
      version: '4',
    }),
  ],
  transports: {
    [brainarkChain.id]: http('https://rpc.brainark.online', {
      timeout: 10_000,
      retryCount: 3,
      retryDelay: 1_000,
    }),
    [mainnet.id]: http(process.env.ETHEREUM_RPC_URL || 'https://ethereum-rpc.publicnode.com', {
      timeout: 15_000,
      retryCount: 3,
      retryDelay: 2_000,
    }),
    [bsc.id]: http(process.env.BSC_RPC_URL || 'https://bsc-rpc.publicnode.com', {
      timeout: 12_000,
      retryCount: 3,
      retryDelay: 1_500,
    }),
    [polygon.id]: http(process.env.POLYGON_RPC_URL || 'https://polygon-bor-rpc.publicnode.com', {
      timeout: 12_000,
      retryCount: 3,
      retryDelay: 1_500,
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

// Enhanced helper function to add BrainArk network to MetaMask with better error handling
export const addBrainArkNetwork = async (): Promise<boolean> => {
  // Check if window.ethereum is available
  if (typeof window === 'undefined' || !window.ethereum) {
    console.error('MetaMask is not installed or not available')
    return false
  }

  // Get the correct ethereum provider (handle multiple wallets)
  let ethereum = window.ethereum
  if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
    const metamaskProvider = window.ethereum.providers.find((p: any) => p.isMetaMask)
    if (metamaskProvider) {
      ethereum = metamaskProvider
    }
  }

  const chainIdHex = `0x${brainarkChain.id.toString(16)}`
  
  try {
    // Test RPC connectivity first
    const rpcTest = await fetch(brainarkChain.rpcUrls.default.http[0], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1
      })
    }).catch(() => null)

    if (!rpcTest || !rpcTest.ok) {
      console.warn('RPC endpoint may be unreachable, but attempting to add network anyway')
    }

    // First try to switch to the network
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    })
    
    console.log('Successfully switched to BrainArk network')
    return true
    
  } catch (switchError: any) {
    console.log('Switch failed, attempting to add network:', switchError.message)
    
    // If the chain doesn't exist (error 4902), add it
    if (switchError.code === 4902 || switchError.message?.includes('Unrecognized chain')) {
      try {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainIdHex,
              chainName: brainarkChain.name,
              nativeCurrency: brainarkChain.nativeCurrency,
              rpcUrls: brainarkChain.rpcUrls.default.http,
              blockExplorerUrls: brainarkChain.blockExplorers ? [brainarkChain.blockExplorers.default.url] : [],
              iconUrls: ['https://brainark.online/favicon.ico'],
            },
          ],
        })
        
        console.log('Successfully added BrainArk network')
        return true
        
      } catch (addError: any) {
        console.error('Failed to add BrainArk network:', addError)
        
        // Provide specific error messages
        if (addError.code === 4001) {
          console.error('User rejected the request to add network')
        } else if (addError.code === -32002) {
          console.error('Request already pending in MetaMask')
        } else {
          console.error('Unknown error adding network:', addError.message)
        }
        return false
      }
    } else if (switchError.code === 4001) {
      console.error('User rejected the request to switch networks')
      return false
    } else if (switchError.code === -32002) {
      console.error('Request already pending in MetaMask')
      return false
    } else {
      console.error('Failed to switch to BrainArk network:', switchError)
      return false
    }
  }
}

// Helper function to check if user is on BrainArk network
export const isBrainArkNetwork = (chainId: number | undefined): boolean => {
  return chainId === brainarkChain.id
}

// Helper function to get network status
export const getNetworkStatus = (chainId: number | undefined) => {
  if (!chainId) return { name: 'Disconnected', color: 'red' }
  
  const chain = [brainarkChain, mainnet, bsc, polygon, optimism, arbitrum, sepolia]
    .find(c => c.id === chainId)
  
  if (chain?.id === brainarkChain.id) {
    return { name: 'BrainArk', color: 'green' }
  } else if (chain) {
    return { name: chain.name, color: 'yellow' }
  } else {
    return { name: 'Unknown', color: 'red' }
  }
}

declare global {
  interface Window {
    ethereum?: any
  }
}
