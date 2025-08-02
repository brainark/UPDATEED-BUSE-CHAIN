import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { configureChains, createConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { brainarkChain, getNetworkConfig } from './config'

// Get network configuration
const networkConfig = getNetworkConfig()

// Configure chains and providers with fallback
const { chains, publicClient } = configureChains(
  [networkConfig.chain],
  [
    // Custom JSON RPC provider for local development
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id === 1337) {
          return {
            http: 'http://localhost:8545',
            // Disable WebSocket for local development to avoid connection issues
            webSocket: undefined,
          }
        }
        return {
          http: chain.rpcUrls.default.http[0],
          // Only use WebSocket in production
          webSocket: networkConfig.environment === 'production' ? chain.rpcUrls.default.webSocket?.[0] : undefined,
        }
      },
    }),
    // Fallback to public provider
    publicProvider(),
  ],
  {
    // Disable WebSocket for local development
    webSocketPublicClient: networkConfig.environment === 'production',
  }
)

// Get WalletConnect project ID with validation
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
const isWalletConnectDisabled = process.env.NEXT_PUBLIC_DISABLE_WALLETCONNECT === 'true'
const hasValidProjectId = projectId && projectId.length > 10 && !projectId.includes('local') && !projectId.includes('default')

// Configure wallets with proper error handling
let connectors: any[] = []

try {
  if (!isWalletConnectDisabled && hasValidProjectId) {
    // Use WalletConnect if we have a valid project ID
    const { connectors: defaultConnectors } = getDefaultWallets({
      appName: 'BrainArk Airdrop DApp',
      projectId: projectId!,
      chains,
    })
    connectors = defaultConnectors
  } else {
    // Use only MetaMask connector for development
    console.warn('WalletConnect disabled or invalid project ID. Using MetaMask only.')
    
    // Import MetaMask connector directly
    const { MetaMaskConnector } = await import('wagmi/connectors/metaMask')
    
    connectors = [
      new MetaMaskConnector({
        chains,
        options: {
          shimDisconnect: true,
          UNSTABLE_shimOnConnectSelectAccount: true,
        },
      }),
    ]
  }
} catch (error) {
  console.error('Error configuring wallet connectors:', error)
  
  // Fallback to basic MetaMask connector
  const { MetaMaskConnector } = await import('wagmi/connectors/metaMask')
  
  connectors = [
    new MetaMaskConnector({
      chains,
      options: {
        shimDisconnect: true,
        UNSTABLE_shimOnConnectSelectAccount: true,
      },
    }),
  ]
}

// Create wagmi config with enhanced error handling
export const wagmiConfig = createConfig({
  autoConnect: false, // Disable auto-connect to prevent issues
  connectors,
  publicClient,
  // Only use WebSocket in production
  webSocketPublicClient: networkConfig.environment === 'production' ? undefined : undefined,
})

export { chains }

// Network switching utility with better error handling
export const switchToLocalNetwork = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // Clear any pending requests first
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Try to switch to local network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x539' }], // 1337 in hex
      })
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x539',
              chainName: 'BrainArk Besu Network (Local)',
              nativeCurrency: {
                name: 'BrainArk',
                symbol: 'BAK',
                decimals: 18,
              },
              rpcUrls: ['http://localhost:8545'],
              blockExplorerUrls: ['http://localhost:3001'],
            }],
          })
        } catch (addError: any) {
          console.error('Failed to add network:', addError)
          throw addError
        }
      } else if (switchError.code === -32002) {
        // Request already pending
        console.warn('Wallet request already pending. Please check MetaMask.')
        throw new Error('Please check MetaMask - there may be a pending request.')
      } else {
        throw switchError
      }
    }
  }
}

// Enhanced network detection with better error handling
export const detectNetwork = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const port = window.location.port
    
    return {
      isLocal: hostname === 'localhost' || hostname === '127.0.0.1' || port === '3000' || port === '3002',
      hostname,
      port,
      expectedChainId: hostname === 'localhost' ? 1337 : 31337,
      expectedChainIdHex: hostname === 'localhost' ? '0x539' : '0x7A69',
    }
  }
  
  return {
    isLocal: false,
    hostname: '',
    port: '',
    expectedChainId: 31337,
    expectedChainIdHex: '0x7A69',
  }
}

// Utility to check if WalletConnect is available
export const isWalletConnectAvailable = () => {
  return !isWalletConnectDisabled && hasValidProjectId
}

// Utility to get connection status
export const getConnectionInfo = () => {
  return {
    walletConnectEnabled: isWalletConnectAvailable(),
    projectId: hasValidProjectId ? projectId : 'Not configured',
    environment: networkConfig.environment,
    chainId: networkConfig.chain.id,
  }
}