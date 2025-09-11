import { createConfig } from 'wagmi'
import { http } from 'viem'
import { mainnet, polygon, optimism, arbitrum, sepolia, bsc } from 'wagmi/chains'
import { Chain } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'
import { walletConnectSingleton, isWalletConnectInitialized } from './walletConnectSingleton'
import { buildTimeWagmiConfig, isBuildTime, isServerSide } from './buildTimeWagmiConfig'

// Define BrainArk chain configuration with proper RPC endpoints
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
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1,
    },
  },
  testnet: false,
}

// Enhanced BSC chain configuration with multiple RPC endpoints
export const enhancedBscChain: Chain = {
  ...bsc,
  rpcUrls: {
    default: {
      http: [
        'https://bsc-dataseed1.binance.org',
        'https://bsc-dataseed2.binance.org',
        'https://bsc-dataseed3.binance.org',
        'https://bsc-rpc.publicnode.com',
        'https://binance.llamarpc.com',
      ],
    },
    public: {
      http: [
        'https://bsc-dataseed1.binance.org',
        'https://bsc-dataseed2.binance.org',
        'https://bsc-rpc.publicnode.com',
      ],
    },
  },
}

// Create wagmi configuration with enhanced network support
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 
                 process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 
                 '138029c5ee4c7a8ecfbe38fddcca1818'

// Create safe connectors function to prevent multiple initialization
const createSafeConnectors = () => {
  const connectors = [
    injected({
      target: 'metaMask',
    }),
  ]

  // Only add WalletConnect and Coinbase if not in build mode
  if (!isBuildTime() && !isServerSide()) {
    try {
      // Add WalletConnect with singleton protection
      if (!isWalletConnectInitialized()) {
        connectors.push(
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
              themeMode: 'dark',
              themeVariables: {
                '--wcm-z-index': '1000',
              },
              enableNetworkView: false, // Disable to prevent fetch issues
              enableAccountView: false, // Disable to prevent fetch issues
            },
          })
        )
      }

      // Add Coinbase Wallet
      connectors.push(
        coinbaseWallet({
          appName: 'BrainArk DApp',
          appLogoUrl: 'https://brainark.online/favicon.ico',
          preference: 'all',
          version: '4',
          enableMobileWalletLink: false, // Disable problematic mobile wallet link
        })
      )
    } catch (error) {
      console.warn('Failed to initialize some wallet connectors:', error)
    }
  }

  return connectors
}

// Create transport configuration with build-time optimization
const createTransports = () => {
  const timeout = isBuildTime() ? 5000 : 15000
  const retryCount = isBuildTime() ? 1 : 3

  return {
    [brainarkChain.id]: http('https://rpc.brainark.online', {
      timeout,
      retryCount,
      retryDelay: 2_000,
    }),
    [mainnet.id]: http('https://eth.llamarpc.com', {
      timeout,
      retryCount,
      retryDelay: 1_000,
    }),
    [enhancedBscChain.id]: http('https://bsc-dataseed1.binance.org', {
      timeout,
      retryCount: isBuildTime() ? 1 : 5,
      retryDelay: 2_000,
      batch: {
        multicall: !isBuildTime(),
      },
    }),
    [polygon.id]: http('https://polygon-rpc.com', {
      timeout,
      retryCount,
      retryDelay: 1_000,
    }),
    [optimism.id]: http('https://mainnet.optimism.io', {
      timeout,
      retryCount: isBuildTime() ? 1 : 2,
    }),
    [arbitrum.id]: http('https://arb1.arbitrum.io/rpc', {
      timeout,
      retryCount: isBuildTime() ? 1 : 2,
    }),
    [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com', {
      timeout,
      retryCount: isBuildTime() ? 1 : 2,
    }),
  }
}

// Export the appropriate config based on environment
export const enhancedWagmiConfig = (() => {
  // Use build-time config during build to prevent timeouts
  if (isBuildTime()) {
    console.log('🏗️ Using build-time wagmi configuration')
    return buildTimeWagmiConfig
  }

  // Use full config for runtime
  return createConfig({
    chains: [
      brainarkChain, // Primary chain first
      mainnet,
      enhancedBscChain, // Enhanced BSC with multiple RPC endpoints
      polygon,
      optimism,
      arbitrum,
      ...(process.env.NODE_ENV === 'development' ? [sepolia] : []),
    ],
    connectors: createSafeConnectors(),
    transports: createTransports(),
    ssr: isServerSide(),
    batch: {
      multicall: !isBuildTime(),
    },
  })
})()

// Enhanced network switching with better error handling and fallback RPC endpoints
export const addNetworkToWallet = async (chainId: number): Promise<boolean> => {
  if (!window.ethereum) {
    console.error('MetaMask is not installed')
    return false
  }

  const networkConfigs: Record<number, any> = {
    [brainarkChain.id]: {
      chainId: `0x${brainarkChain.id.toString(16)}`,
      chainName: brainarkChain.name,
      nativeCurrency: brainarkChain.nativeCurrency,
      rpcUrls: brainarkChain.rpcUrls.default.http,
      blockExplorerUrls: brainarkChain.blockExplorers ? [brainarkChain.blockExplorers.default.url] : [],
      iconUrls: ['https://brainark.online/favicon.ico'],
    },
    [mainnet.id]: {
      chainId: '0x1',
      chainName: 'Ethereum Mainnet',
      nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
      rpcUrls: ['https://eth.llamarpc.com', 'https://ethereum-rpc.publicnode.com'],
      blockExplorerUrls: ['https://etherscan.io'],
    },
    [enhancedBscChain.id]: {
      chainId: '0x38',
      chainName: 'BNB Smart Chain',
      nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
      rpcUrls: [
        'https://bsc-dataseed1.binance.org',
        'https://bsc-dataseed2.binance.org',
        'https://bsc-rpc.publicnode.com',
      ],
      blockExplorerUrls: ['https://bscscan.com'],
    },
    [polygon.id]: {
      chainId: '0x89',
      chainName: 'Polygon Mainnet',
      nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
      rpcUrls: ['https://polygon-rpc.com', 'https://polygon-bor-rpc.publicnode.com'],
      blockExplorerUrls: ['https://polygonscan.com'],
    },
  }

  const config = networkConfigs[chainId]
  if (!config) {
    console.error(`Network configuration not found for chainId: ${chainId}`)
    return false
  }

  try {
    // First try to switch to the network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: config.chainId }],
    })
    return true
  } catch (switchError: any) {
    // If the chain doesn't exist, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [config],
        })
        return true
      } catch (addError) {
        console.error('Failed to add network:', addError)
        return false
      }
    } else {
      console.error('Failed to switch to network:', switchError)
      return false
    }
  }
}

// Enhanced network switching with timeout and retry logic
export const switchToNetwork = async (chainId: number, maxRetries: number = 3): Promise<boolean> => {
  if (!window.ethereum) {
    throw new Error('MetaMask not available')
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Network switch timeout')), 30000)
      })

      // Try to switch network with timeout
      const switchPromise = addNetworkToWallet(chainId)
      const success = await Promise.race([switchPromise, timeoutPromise])

      if (success) {
        // Verify the switch was successful
        await new Promise(resolve => setTimeout(resolve, 1000))
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })
        const currentChainIdNumber = parseInt(currentChainId, 16)
        
        if (currentChainIdNumber === chainId) {
          return true
        } else if (attempt < maxRetries) {
          console.warn(`Network switch verification failed, retrying... (${attempt}/${maxRetries})`)
          continue
        }
      }
    } catch (error: any) {
      console.error(`Network switch attempt ${attempt} failed:`, error)
      
      if (attempt === maxRetries) {
        throw error
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  return false
}

// Helper function to check if user is on correct network
export const isCorrectNetwork = (chainId: number | undefined, targetChainId: number): boolean => {
  return chainId === targetChainId
}

// Helper function to get network status with enhanced info
export const getEnhancedNetworkStatus = (chainId: number | undefined) => {
  if (!chainId) return { name: 'Disconnected', color: 'red', icon: '❌' }
  
  const networks = [
    { id: brainarkChain.id, name: 'BrainArk', color: 'green', icon: '🧠' },
    { id: mainnet.id, name: 'Ethereum', color: 'blue', icon: '💎' },
    { id: enhancedBscChain.id, name: 'BSC', color: 'yellow', icon: '🟡' },
    { id: polygon.id, name: 'Polygon', color: 'purple', icon: '🟣' },
  ]
  
  const network = networks.find(n => n.id === chainId)
  
  if (network) {
    return network
  } else {
    return { name: 'Unknown', color: 'red', icon: '❓' }
  }
}

// Treasury address validation
export const validateTreasuryAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// Get treasury address for specific network and token
export const getTreasuryAddressForNetwork = (network: string, token: string): string => {
  const treasuryMap: Record<string, Record<string, string>> = {
    ethereum: {
      ETH: process.env.NEXT_PUBLIC_ETH_MAINNET_TREASURY || '0xC91A5902da7321054cEdAeB49ce9A6a3835Fc417',
      USDT: process.env.NEXT_PUBLIC_USDT_ETHEREUM_TREASURY || '0xc9dE877a53f85BF51D76faed0C8c8842EFb35782',
      USDC: process.env.NEXT_PUBLIC_USDC_ETHEREUM_TREASURY || '0x3A9ca3d316F2032d3a21741cBea2e047fd3C1145',
    },
    bsc: {
      BNB: process.env.NEXT_PUBLIC_BNB_BSC_TREASURY || '0x794F67aA174bD0A252BeCA0089490a58Cc695a05',
      USDT: process.env.NEXT_PUBLIC_USDT_BSC_TREASURY || '0xC13527f3bBAaf4cd726d07a78da9C5b74876527F',
      USDC: process.env.NEXT_PUBLIC_USDC_BSC_TREASURY || '0x21FCcbB9b9b7c620BCbA61B6668C30F64C22859c',
    },
    polygon: {
      MATIC: process.env.NEXT_PUBLIC_MATIC_POLYGON_TREASURY || '0x6351f025E2DDe967A1FAD29d0fF44C3620F4EED7',
      USDT: process.env.NEXT_PUBLIC_USDT_POLYGON_TREASURY || '0xd413afAB39D24462ACE36CFE5D710Ce9B813c84B',
      USDC: process.env.NEXT_PUBLIC_USDC_POLYGON_TREASURY || '0xE97BF18735a1AB4A1bA9DDF284D7798A5B0f8a84',
    },
  }

  const address = treasuryMap[network]?.[token]
  if (!address || !validateTreasuryAddress(address)) {
    console.error(`Invalid or missing treasury address for ${network}:${token}`)
    return ''
  }

  return address
}

declare global {
  interface Window {
    ethereum?: any
  }
}

export default enhancedWagmiConfig