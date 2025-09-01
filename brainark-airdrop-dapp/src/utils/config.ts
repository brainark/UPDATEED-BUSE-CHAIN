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
  AIRDROP: process.env.NEXT_PUBLIC_AIRDROP_CONTRACT || '0x1Df35D8e45E0192cD3C25B007a5417b2235642E5', // REAL BrainArkAirdrop
  EPO: process.env.NEXT_PUBLIC_EPO_CONTRACT || '0x979a866bcf3c4ca6840bf7c2615d9b251b43f7a7', // REAL BrainArkEPOComplete
  // Payment tokens for EPO (multi-chain support)
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT Ethereum mainnet
  USDC: '0xA0b86a33E6441E6C8C7F1C7C8C7F1C7C8C7F1C7C', // USDC (bridged)
  BNB: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52', // BNB token
} as const

export const CONTRACT_ADDRESSES = isLocal ? LOCAL_CONTRACT_ADDRESSES : PRODUCTION_CONTRACT_ADDRESSES

// Wallet Addresses
export const WALLET_ADDRESSES = {
  AIRDROP_DISTRIBUTION: '0x15Ef0864D17b2E559D704EF08C7d692eFbC0A4eF',
  EPO_TREASURY: '0xE45ab484E375f34A429169DeB52C94ab49E8838f',
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
