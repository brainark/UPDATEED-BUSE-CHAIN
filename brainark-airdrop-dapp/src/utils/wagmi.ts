import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { brainarkChain, getNetworkConfig } from './config'

// Get network configuration
const networkConfig = getNetworkConfig()

// Configure chains
export const chains = [networkConfig.chain]

// Get WalletConnect project ID with validation
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'dummy'

// Create wagmi config with Rainbow Kit v2
export const wagmiConfig = getDefaultConfig({
  appName: 'BrainArk Airdrop DApp',
  projectId,
  chains: [networkConfig.chain as any],
  ssr: false, // Disable SSR to prevent hydration issues
})