import { Chain } from 'viem'

// Environment detection
const isProduction = process.env.NODE_ENV === 'production'
const isLocal = process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && window.location.hostname === 'localhost')

// BrainArk Besu Chain Configuration - Local Development
export const brainarkChainLocal: Chain = {
  id: 424242,
  name: 'BrainArk Besu Network (Local)',
  nativeCurrency: {
    decimals: 18,
    name: 'BrainArk',
    symbol: 'BAK',
  },
  rpcUrls: {
    public: { http: ['http://localhost:8545'] },
    default: { http: ['http://localhost:8545'] },
  },
  blockExplorers: {
    default: { name: 'BrainArk Local Explorer', url: 'http://localhost:3001' },
  },
  testnet: true,
}

// BrainArk Besu Chain Configuration - Production
export const brainarkChainProduction: Chain = {
  id: 424242,
  name: 'BrainArk Besu Network',
  nativeCurrency: {
    decimals: 18,
    name: 'BrainArk',
    symbol: 'BAK',
  },
  rpcUrls: {
    public: { http: ['https://rpc.brainark.online'] },
    default: { http: ['https://rpc.brainark.online'] },
  },
  blockExplorers: {
    default: { name: 'BrainArk Explorer', url: 'https://explorer.brainark.online' },
  },
  testnet: false,
}

// Export the appropriate chain based on environment
export const brainarkChain = isLocal ? brainarkChainLocal : brainarkChainProduction

// Contract Addresses - Local Development
const LOCAL_CONTRACT_ADDRESSES = {
  AIRDROP: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Local deployment
  EPO: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // Local deployment
  // Payment tokens for EPO (local test tokens)
  USDT: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  USDC: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  BNB: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
} as const

// Contract Addresses - Production (Latest Deployed - REAL CONTRACTS)
const PRODUCTION_CONTRACT_ADDRESSES = {
  AIRDROP: process.env.NEXT_PUBLIC_AIRDROP_CONTRACT || '0x1Df35D8e45E0192cD3C25B007a5417b2235642E5', // REAL BrainArkAirdrop - 14.9M BAK
  EPO: process.env.NEXT_PUBLIC_EPO_CONTRACT || '0xdE04886D4e89f48F73c1684f2e610b25D561DD48', // REAL BrainArkEPOComplete - 100M BAK
} as const

export const CONTRACT_ADDRESSES = isLocal ? LOCAL_CONTRACT_ADDRESSES : PRODUCTION_CONTRACT_ADDRESSES

// Treasury Addresses - Real Production Wallets
export const TREASURY_ADDRESSES = {
  // Ethereum Mainnet Treasuries
  ETH_MAINNET: process.env.NEXT_PUBLIC_ETH_MAINNET_TREASURY || '0xC91A5902da7321054cEdAeB49ce9A6a3835Fc417',
  USDT_ETHEREUM: process.env.NEXT_PUBLIC_USDT_ETHEREUM_TREASURY || '0xc9dE877a53f85BF51D76faed0C8c8842EFb35782',
  USDC_ETHEREUM: process.env.NEXT_PUBLIC_USDC_ETHEREUM_TREASURY || '0x3A9ca3d316F2032d3a21741cBea2e047fd3C1145',
  
  // BSC Mainnet Treasuries
  BNB_BSC: process.env.NEXT_PUBLIC_BNB_BSC_TREASURY || '0x794F67aA174bD0A252BeCA0089490a58Cc695a05',
  USDT_BSC: process.env.NEXT_PUBLIC_USDT_BSC_TREASURY || '0xC13527f3bBAaf4cd726d07a78da9C5b74876527F',
  USDC_BSC: process.env.NEXT_PUBLIC_USDC_BSC_TREASURY || '0x21FCcbB9b9b7c620BCbA61B6668C30F64C22859c',
  
  // Polygon Mainnet Treasuries
  MATIC_POLYGON: process.env.NEXT_PUBLIC_MATIC_POLYGON_TREASURY || '0x6351f025E2DDe967A1FAD29d0fF44C3620F4EED7',
  USDT_POLYGON: process.env.NEXT_PUBLIC_USDT_POLYGON_TREASURY || '0xd413afAB39D24462ACE36CFE5D710Ce9B813c84B',
  USDC_POLYGON: process.env.NEXT_PUBLIC_USDC_POLYGON_TREASURY || '0xE97BF18735a1AB4A1bA9DDF284D7798A5B0f8a84',
  
  // BrainArk Network Treasury
  BAK_BRAINARK: process.env.NEXT_PUBLIC_BAK_BRAINARK_TREASURY || '0xC7A3e128f909153442D931BA430AC9aA55E9370D',
  
  // Admin/Owner Addresses
  ADMIN: process.env.NEXT_PUBLIC_ADMIN_ADDRESS || '0xc9dE877a53f85BF51D76faed0C8c8842EFb35782',
  OWNER: process.env.NEXT_PUBLIC_OWNER_ADDRESS || '0xc9dE877a53f85BF51D76faed0C8c8842EFb35782',
  FUNDING_WALLET: process.env.NEXT_PUBLIC_FUNDING_WALLET || '0xc9dE877a53f85BF51D76faed0C8c8842EFb35782',
} as const

// Airdrop Configuration
export const AIRDROP_CONFIG = {
  TOTAL_SUPPLY: 10_000_000, // 10M coins
  COINS_PER_USER: 10,
  TARGET_PARTICIPANTS: 1_000_000,
  REFERRAL_BONUS: 3.2,
  REFERRAL_POOL: 5_000_000, // 5M coins
  DISTRIBUTION_DELAY: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
} as const

// EPO Configuration - Enhanced with bonding curve and 100M supply
export const EPO_CONFIG = {
  PRICE_START: 0.02, // Starting price $0.02 per BAK
  PRICE_END: 0.04,   // Ending price $0.04 per BAK
  TOTAL_SUPPLY: 100_000_000, // 100M coins
  DURATION_DAYS: 30, // 30-day time limit
  ACCEPTED_TOKENS: ['ETH', 'USDT', 'USDC', 'BNB'],
  START_DATE: new Date('2024-01-01T00:00:00Z'), // EPO start date
  EXTENSION_ENABLED: true, // Allow extension if 100M not sold
} as const

// Social Links
export const SOCIAL_LINKS = {
  TWITTER: 'https://x.com/sdogcoin1',
  TELEGRAM: 'https://t.me/Brainark_Besu_BlockChain',
  TELEGRAM_GROUP_ID: '@Brainark_Besu_BlockChain',
} as const

// API Configuration
export const API_CONFIG = {
  TWITTER_API_BASE: 'https://api.twitter.com/2',
  TELEGRAM_BOT_API: 'https://api.telegram.org/bot',
  FIREBASE_CONFIG: {
    // To be configured with actual Firebase credentials
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
} as const

// Environment Variables
export const ENV = {
  TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'default-project-id',
  IS_LOCAL: isLocal,
  IS_PRODUCTION: isProduction,
} as const

// Network Detection Utility
export const getNetworkConfig = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const port = window.location.port
    
    if (hostname === 'localhost' || hostname === '127.0.0.1' || port === '3000') {
      return {
        chain: brainarkChainLocal,
        contracts: LOCAL_CONTRACT_ADDRESSES,
        environment: 'local'
      }
    }
  }
  
  return {
    chain: brainarkChainProduction,
    contracts: PRODUCTION_CONTRACT_ADDRESSES,
    environment: 'production'
  }
}
