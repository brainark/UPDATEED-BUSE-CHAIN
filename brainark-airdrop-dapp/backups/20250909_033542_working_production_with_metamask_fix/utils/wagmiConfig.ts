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

// Create wagmi configuration manually to exclude Safe connector
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '0a1cdc678a1869275bb663eaf7eba7bb'

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
    injected(),
    walletConnect({ 
      projectId,
      metadata: {
        name: 'BrainArk DApp',
        description: 'BrainArk Besu Chain DApp - The Future of Decentralized Intelligence',
        url: 'https://dapp.brainark.online',
        icons: ['https://brainark.online/favicon.ico']
      },
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'light',
        themeVariables: {
          '--wcm-z-index': '1000'
        }
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

// Helper function to add BrainArk network to MetaMask
export const addBrainArkNetwork = async (): Promise<boolean> => {
  if (!window.ethereum) {
    console.error('MetaMask is not installed')
    return false
  }

  try {
    // First try to switch to the network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${brainarkChain.id.toString(16)}` }],
    })
    return true
  } catch (switchError: any) {
    // If the chain doesn't exist, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${brainarkChain.id.toString(16)}`,
              chainName: brainarkChain.name,
              nativeCurrency: brainarkChain.nativeCurrency,
              rpcUrls: [brainarkChain.rpcUrls.default.http[0]],
              blockExplorerUrls: brainarkChain.blockExplorers ? [brainarkChain.blockExplorers.default.url] : [],
              iconUrls: [], // Add icon URLs if you have them
            },
          ],
        })
        return true
      } catch (addError) {
        console.error('Failed to add BrainArk network:', addError)
        return false
      }
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
