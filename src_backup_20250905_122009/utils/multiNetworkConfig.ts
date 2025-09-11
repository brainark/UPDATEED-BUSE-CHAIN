// Multi-Network Treasury Configuration - Updated with Correct Treasury Addresses
// Handles payments across Ethereum, BSC, Polygon, and BrainArk networks

export interface NetworkConfig {
  chainId: number
  chainIdHex: string
  name: string
  rpcUrl: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  blockExplorerUrl: string
}

export interface TokenConfig {
  symbol: string
  name: string
  decimals: number
  contractAddress: string
  treasuryAddress: string
  icon: string
  network: string
  chainId: number
}

export interface PaymentOption {
  token: TokenConfig
  network: NetworkConfig
  treasuryAddress: string
  isNative: boolean // true for ETH, BNB, MATIC
}

// Network Configurations
export const NETWORKS: Record<string, NetworkConfig> = {
  ethereum: {
    chainId: 1,
    chainIdHex: '0x1',
    name: 'Ethereum Mainnet',
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://ethereum-rpc.publicnode.com',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    blockExplorerUrl: 'https://etherscan.io'
  },
  bsc: {
    chainId: 56,
    chainIdHex: '0x38',
    name: 'BSC Mainnet',
    rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-rpc.publicnode.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    blockExplorerUrl: 'https://bscscan.com'
  },
  polygon: {
    chainId: 137,
    chainIdHex: '0x89',
    name: 'Polygon Mainnet',
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-bor-rpc.publicnode.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    blockExplorerUrl: 'https://polygonscan.com'
  },
  brainark: {
    chainId: 424242,
    chainIdHex: '0x67932',
    name: 'BrainArk Network',
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.brainark.online',
    nativeCurrency: {
      name: 'BrainArk Native Coin',
      symbol: 'BAK',
      decimals: 18
    },
    blockExplorerUrl: 'https://explorer.brainark.online'
  }
}

// Token Configurations for each network - Updated with correct treasury addresses
export const PAYMENT_TOKENS: TokenConfig[] = [
  // Ethereum Network Tokens
  {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    contractAddress: '0x0000000000000000000000000000000000000000', // Native token
    treasuryAddress: process.env.NEXT_PUBLIC_ETH_MAINNET_TREASURY || '0xC91A5902da7321054cEdAeB49ce9A6a3835Fc417',
    icon: '💎',
    network: 'ethereum',
    chainId: 1
  },
  {
    symbol: 'USDT',
    name: 'Tether USD (Ethereum)',
    decimals: 6,
    contractAddress: process.env.USDT_ETHEREUM_CONTRACT || '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    treasuryAddress: process.env.NEXT_PUBLIC_USDT_ETHEREUM_TREASURY || '0xc9dE877a53f85BF51D76faed0C8c8842EFb35782',
    icon: '💵',
    network: 'ethereum',
    chainId: 1
  },
  {
    symbol: 'USDC',
    name: 'USD Coin (Ethereum)',
    decimals: 6,
    contractAddress: process.env.USDC_ETHEREUM_CONTRACT || '0xA0b86a33E6441E2EbA2714d3079559c00c35dFD0',
    treasuryAddress: process.env.NEXT_PUBLIC_USDC_ETHEREUM_TREASURY || '0x3A9ca3d316F2032d3a21741cBea2e047fd3C1145',
    icon: '🔵',
    network: 'ethereum',
    chainId: 1
  },
  
  // BSC Network Tokens
  {
    symbol: 'BNB',
    name: 'Binance Coin',
    decimals: 18,
    contractAddress: '0x0000000000000000000000000000000000000000', // Native token
    treasuryAddress: process.env.NEXT_PUBLIC_BNB_BSC_TREASURY || '0x794F67aA174bD0A252BeCA0089490a58Cc695a05',
    icon: '🟡',
    network: 'bsc',
    chainId: 56
  },
  {
    symbol: 'USDT',
    name: 'Tether USD (BSC)',
    decimals: 18,
    contractAddress: process.env.USDT_BSC_CONTRACT || '0x55d398326f99059fF775485246999027B3197955',
    treasuryAddress: process.env.NEXT_PUBLIC_USDT_BSC_TREASURY || '0xC13527f3bBAaf4cd726d07a78da9C5b74876527F',
    icon: '💵',
    network: 'bsc',
    chainId: 56
  },
  {
    symbol: 'USDC',
    name: 'USD Coin (BSC)',
    decimals: 18,
    contractAddress: process.env.USDC_BSC_CONTRACT || '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    treasuryAddress: process.env.NEXT_PUBLIC_USDC_BSC_TREASURY || '0x21FCcbB9b9b7c620BCbA61B6668C30F64C22859c',
    icon: '🔵',
    network: 'bsc',
    chainId: 56
  },
  
  // Polygon Network Tokens
  {
    symbol: 'MATIC',
    name: 'Polygon',
    decimals: 18,
    contractAddress: '0x0000000000000000000000000000000000000000', // Native token
    treasuryAddress: process.env.NEXT_PUBLIC_MATIC_POLYGON_TREASURY || '0x6351f025E2DDe967A1FAD29d0fF44C3620F4EED7',
    icon: '🟣',
    network: 'polygon',
    chainId: 137
  },
  {
    symbol: 'USDT',
    name: 'Tether USD (Polygon)',
    decimals: 6,
    contractAddress: process.env.USDT_POLYGON_CONTRACT || '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    treasuryAddress: process.env.NEXT_PUBLIC_USDT_POLYGON_TREASURY || '0xd413afAB39D24462ACE36CFE5D710Ce9B813c84B',
    icon: '💵',
    network: 'polygon',
    chainId: 137
  },
  {
    symbol: 'USDC',
    name: 'USD Coin (Polygon)',
    decimals: 6,
    contractAddress: process.env.USDC_POLYGON_CONTRACT || '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    treasuryAddress: process.env.NEXT_PUBLIC_USDC_POLYGON_TREASURY || '0xE97BF18735a1AB4A1bA9DDF284D7798A5B0f8a84',
    icon: '🔵',
    network: 'polygon',
    chainId: 137
  }
]

// Payment Options with Network Information
export const PAYMENT_OPTIONS: PaymentOption[] = PAYMENT_TOKENS.map(token => ({
  token,
  network: NETWORKS[token.network],
  treasuryAddress: token.treasuryAddress,
  isNative: token.contractAddress === '0x0000000000000000000000000000000000000000'
}))

// Utility Functions
export const getPaymentOptionsByNetwork = (networkName: string): PaymentOption[] => {
  return PAYMENT_OPTIONS.filter(option => option.token.network === networkName)
}

export const getPaymentOptionByTokenAndNetwork = (tokenSymbol: string, networkName: string): PaymentOption | undefined => {
  return PAYMENT_OPTIONS.find(option => 
    option.token.symbol === tokenSymbol && option.token.network === networkName
  )
}

export const getNetworkByChainId = (chainId: number): NetworkConfig | undefined => {
  return Object.values(NETWORKS).find(network => network.chainId === chainId)
}

export const getSupportedNetworks = (): NetworkConfig[] => {
  return Object.values(NETWORKS).filter(network => network.name !== 'BrainArk Network')
}

export const getBrainArkNetwork = (): NetworkConfig => {
  return NETWORKS.brainark
}

// Token Price Configuration (in USD) - Default fallback prices
export const DEFAULT_TOKEN_PRICES: Record<string, number> = {
  ETH: 2000, // Fallback price
  BNB: 300,  // Fallback price
  MATIC: 0.8, // Fallback price
  USDT: 1,   // Stable
  USDC: 1    // Stable
}

// Current token prices (updated automatically)
export let TOKEN_PRICES: Record<string, number> = { ...DEFAULT_TOKEN_PRICES }

// Fetch real-time token prices from CoinGecko API with better error handling
export const fetchTokenPrices = async (): Promise<Record<string, number>> => {
  try {
    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 12000) // 12 second timeout
    
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,binancecoin,matic-network,tether,usd-coin&vs_currencies=usd',
      {
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      }
    )
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    
    const updatedPrices = {
      ETH: data.ethereum?.usd || DEFAULT_TOKEN_PRICES.ETH,
      BNB: data.binancecoin?.usd || DEFAULT_TOKEN_PRICES.BNB,
      MATIC: data['matic-network']?.usd || DEFAULT_TOKEN_PRICES.MATIC,
      USDT: data.tether?.usd || DEFAULT_TOKEN_PRICES.USDT,
      USDC: data['usd-coin']?.usd || DEFAULT_TOKEN_PRICES.USDC
    }

    // Update global TOKEN_PRICES
    TOKEN_PRICES = updatedPrices
    
    console.log('Token prices updated:', updatedPrices)
    return updatedPrices

  } catch (error) {
    console.error('Error fetching token prices:', error)
    console.log('Using fallback token prices')
    TOKEN_PRICES = { ...DEFAULT_TOKEN_PRICES }
    return DEFAULT_TOKEN_PRICES
  }
}

// Auto-update token prices every 5 minutes
let priceUpdateInterval: NodeJS.Timeout | null = null

export const startTokenPriceUpdates = () => {
  // Initial fetch
  fetchTokenPrices()
  
  // Set up interval for updates (5 minutes)
  if (priceUpdateInterval) {
    clearInterval(priceUpdateInterval)
  }
  
  priceUpdateInterval = setInterval(() => {
    fetchTokenPrices()
  }, 5 * 60 * 1000) // 5 minutes
}

export const stopTokenPriceUpdates = () => {
  if (priceUpdateInterval) {
    clearInterval(priceUpdateInterval)
    priceUpdateInterval = null
  }
}

// Get current token price with automatic fallback
export const getTokenPrice = (symbol: string): number => {
  return TOKEN_PRICES[symbol] || DEFAULT_TOKEN_PRICES[symbol] || 1
}

// BAK Token Configuration
export const BAK_CONFIG = {
  priceUSD: 0.02, // $0.02 per BAK
  symbol: 'BAK',
  name: 'BrainArk Native Coin',
  decimals: 18,
  distributionAddress: process.env.NEXT_PUBLIC_BAK_BRAINARK_TREASURY || '0xC7A3e128f909153442D931BA430AC9aA55E9370D'
}

// Calculate BAK amount based on payment
export const calculateBAKAmount = (paymentAmount: number, tokenSymbol: string): number => {
  const tokenPrice = TOKEN_PRICES[tokenSymbol] || 1
  const usdValue = paymentAmount * tokenPrice
  return usdValue / BAK_CONFIG.priceUSD
}

// Calculate USD value of payment
export const calculateUSDValue = (paymentAmount: number, tokenSymbol: string): number => {
  const tokenPrice = TOKEN_PRICES[tokenSymbol] || 1
  return paymentAmount * tokenPrice
}

// Network switching helper
export const switchToNetwork = async (networkConfig: NetworkConfig): Promise<boolean> => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not available')
  }

  try {
    // Try to switch to the network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: networkConfig.chainIdHex }],
    })
    return true
  } catch (switchError: any) {
    // If network doesn't exist, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: networkConfig.chainIdHex,
            chainName: networkConfig.name,
            nativeCurrency: networkConfig.nativeCurrency,
            rpcUrls: [networkConfig.rpcUrl],
            blockExplorerUrls: [networkConfig.blockExplorerUrl],
          }],
        })
        return true
      } catch (addError) {
        throw new Error(`Failed to add network: ${addError}`)
      }
    } else {
      throw new Error(`Failed to switch network: ${switchError.message}`)
    }
  }
}

// Get current network from MetaMask
export const getCurrentNetwork = async (): Promise<number | null> => {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null
  }

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' })
    return parseInt(chainId, 16)
  } catch (error) {
    console.error('Error getting current network:', error)
    return null
  }
}

// Validate if user is on correct network for selected token
export const validateNetworkForToken = async (tokenConfig: TokenConfig): Promise<boolean> => {
  const currentChainId = await getCurrentNetwork()
  return currentChainId === tokenConfig.chainId
}

// Get all treasury addresses for monitoring
export const getAllTreasuryAddresses = (): Record<string, string[]> => {
  const treasuryByNetwork: Record<string, string[]> = {}
  
  PAYMENT_TOKENS.forEach(token => {
    if (!treasuryByNetwork[token.network]) {
      treasuryByNetwork[token.network] = []
    }
    if (!treasuryByNetwork[token.network].includes(token.treasuryAddress)) {
      treasuryByNetwork[token.network].push(token.treasuryAddress)
    }
  })
  
  return treasuryByNetwork
}

// Get treasury address for specific token and network
export const getTreasuryAddress = (tokenSymbol: string, networkName: string): string | null => {
  const option = getPaymentOptionByTokenAndNetwork(tokenSymbol, networkName)
  return option ? option.treasuryAddress : null
}

export default {
  NETWORKS,
  PAYMENT_TOKENS,
  PAYMENT_OPTIONS,
  TOKEN_PRICES,
  BAK_CONFIG,
  getPaymentOptionsByNetwork,
  getPaymentOptionByTokenAndNetwork,
  getNetworkByChainId,
  getSupportedNetworks,
  getBrainArkNetwork,
  calculateBAKAmount,
  calculateUSDValue,
  switchToNetwork,
  getCurrentNetwork,
  validateNetworkForToken,
  getAllTreasuryAddresses,
  getTreasuryAddress
}