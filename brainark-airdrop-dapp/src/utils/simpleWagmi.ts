import { configureChains, createConfig } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { InjectedConnector } from 'wagmi/connectors/injected'
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
        if (chain.id === 424242) {
          const isLocal = typeof window !== 'undefined' && 
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          
          return {
            http: isLocal ? 'http://localhost:8545' : 'https://rpc.brainark.online',
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
  ]
)

// Simple connectors without WalletConnect
const connectors = [
  new MetaMaskConnector({
    chains,
    options: {
      shimDisconnect: true,
      UNSTABLE_shimOnConnectSelectAccount: true,
    },
  }),
  new InjectedConnector({
    chains,
    options: {
      name: 'Injected Wallet',
      shimDisconnect: true,
    },
  }),
]

// Create simple wagmi config without WalletConnect
export const simpleWagmiConfig = createConfig({
  autoConnect: false, // Disable auto-connect to prevent issues
  connectors,
  publicClient,
})

export { chains }

// Network switching utility
export const switchToBrainArkNetwork = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // Clear any pending requests first
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Try to switch to BrainArk network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x67932' }], // 424242 in hex
      })
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          const networkConfig = isLocal ? {
            chainId: '0x67932',
            chainName: 'BrainArk Besu Network (Local)',
            nativeCurrency: {
              name: 'BrainArk',
              symbol: 'BAK',
              decimals: 18,
            },
            rpcUrls: ['http://localhost:8545'],
            blockExplorerUrls: ['http://localhost:3001'],
          } : {
            chainId: '0x67932',
            chainName: 'BrainArk Besu Network',
            nativeCurrency: {
              name: 'BrainArk',
              symbol: 'BAK',
              decimals: 18,
            },
            rpcUrls: ['https://rpc.brainark.online'],
            blockExplorerUrls: ['https://explorer.brainark.online'],
          }
          
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          })
        } catch (addError: any) {
          console.error('Failed to add network:', addError)
          throw addError
        }
      } else if (switchError.code === -32002) {
        // Request already pending
        throw new Error('Please check MetaMask - there may be a pending request.')
      } else {
        throw switchError
      }
    }
  }
}