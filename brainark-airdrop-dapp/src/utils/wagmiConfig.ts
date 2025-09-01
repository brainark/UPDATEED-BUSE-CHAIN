import { createConfig } from 'wagmi'
import { http } from 'viem'
import { mainnet, polygon, optimism, arbitrum, sepolia } from 'wagmi/chains'
import { Chain } from 'wagmi/chains'

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
    polygon,
    optimism,
    arbitrum,
    ...(process.env.NODE_ENV === 'development' ? [sepolia] : []),
  ],
  transports: {
    [brainarkChain.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    ...(process.env.NODE_ENV === 'development' ? { [sepolia.id]: http() } : {}),
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
              blockExplorerUrls: [brainarkChain.blockExplorers.default.url],
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
  
  const chain = [brainarkChain, mainnet, polygon, optimism, arbitrum, sepolia]
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
