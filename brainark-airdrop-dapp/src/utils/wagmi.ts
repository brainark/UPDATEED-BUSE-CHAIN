import { createConfig } from 'wagmi'
import { http } from 'viem'
import { brainarkChain, getNetworkConfig } from './config'

// Get network configuration
const networkConfig = getNetworkConfig()

// Configure chains
export const chains = [networkConfig.chain]

// Create minimal wagmi config without connectors to avoid Safe import
export const wagmiConfig = createConfig({
  chains: [networkConfig.chain as any],
  transports: {
    [networkConfig.chain.id]: http(),
  },
  ssr: false,
})