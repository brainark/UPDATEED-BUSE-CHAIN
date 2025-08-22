// BrainArk DApp Server Configuration
// This file contains the configuration for connecting to your public server

const serverConfig = {
  // Production Server Configuration
  production: {
    // Your public server details
    serverUrl: 'https://brainark.online', // Replace with your actual domain
    apiUrl: 'https://api.brainark.online', // API endpoint
    rpcUrl: 'https://rpc.brainark.online', // BrainArk RPC endpoint
    explorerUrl: 'https://explorer.brainark.online', // Block explorer
    
    // Network Configuration
    chainId: 424242,
    networkName: 'BrainArk Besu Network',
    nativeCurrency: {
      name: 'BAK',
      symbol: 'BAK',
      decimals: 18
    },
    
    // Contract Addresses (from deployment)
    contracts: {
      epo: process.env.NEXT_PUBLIC_EPO_CONTRACT || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      airdrop: process.env.NEXT_PUBLIC_AIRDROP_CONTRACT || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      fundingWallet: process.env.NEXT_PUBLIC_FUNDING_WALLET || '0xC7A3e128f909153442D931BA430AC9aA55E9370D'
    },
    
    // Treasury Wallets (Multi-Network)
    treasuries: {
      ethereum: {
        eth: process.env.NEXT_PUBLIC_ETH_MAINNET_TREASURY,
        usdt: process.env.NEXT_PUBLIC_USDT_ETHEREUM_TREASURY,
        usdc: process.env.NEXT_PUBLIC_USDC_ETHEREUM_TREASURY
      },
      bsc: {
        bnb: process.env.NEXT_PUBLIC_BNB_BSC_TREASURY,
        usdt: process.env.NEXT_PUBLIC_USDT_BSC_TREASURY,
        usdc: process.env.NEXT_PUBLIC_USDC_BSC_TREASURY
      },
      polygon: {
        matic: process.env.NEXT_PUBLIC_MATIC_POLYGON_TREASURY,
        usdt: process.env.NEXT_PUBLIC_USDT_POLYGON_TREASURY,
        usdc: process.env.NEXT_PUBLIC_USDC_POLYGON_TREASURY
      },
      brainark: {
        bak: process.env.NEXT_PUBLIC_BAK_BRAINARK_TREASURY
      }
    },
    
    // Database Configuration (if using)
    database: {
      type: 'appwrite', // or 'firebase', 'mongodb', etc.
      endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
      projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
    },
    
    // Social Media Integration
    social: {
      telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        channelUrl: 'https://t.me/Brainark_Besu_BlockChain'
      },
      twitter: {
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        profileUrl: 'https://x.com/sdogcoin1?s=21'
      }
    },
    
    // Security Configuration
    security: {
      adminAddress: process.env.NEXT_PUBLIC_ADMIN_ADDRESS,
      ownerAddress: process.env.NEXT_PUBLIC_OWNER_ADDRESS,
      nextAuthSecret: process.env.NEXTAUTH_SECRET,
      nextAuthUrl: process.env.NEXTAUTH_URL
    }
  },
  
  // Development Server Configuration
  development: {
    serverUrl: 'http://localhost:3000',
    apiUrl: 'http://localhost:3000/api',
    rpcUrl: 'http://localhost:8545',
    explorerUrl: 'http://localhost:3001',
    
    chainId: 1337, // Local Hardhat network
    networkName: 'BrainArk Local Network',
    nativeCurrency: {
      name: 'BAK',
      symbol: 'BAK',
      decimals: 18
    },
    
    // Same contract addresses work for both environments
    contracts: {
      epo: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      airdrop: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      fundingWallet: '0xC7A3e128f909153442D931BA430AC9aA55E9370D'
    }
  }
};

// Get current environment configuration
const getCurrentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  const networkEnv = process.env.NEXT_PUBLIC_NETWORK_ENV || 'development';
  
  if (networkEnv === 'production') {
    return serverConfig.production;
  }
  
  return serverConfig.development;
};

// Export configuration
module.exports = {
  serverConfig,
  getCurrentConfig,
  
  // Helper functions for server connection
  getApiUrl: (endpoint = '') => {
    const config = getCurrentConfig();
    return `${config.apiUrl}${endpoint}`;
  },
  
  getRpcUrl: () => {
    const config = getCurrentConfig();
    return config.rpcUrl;
  },
  
  getExplorerUrl: (txHash = '') => {
    const config = getCurrentConfig();
    return txHash ? `${config.explorerUrl}/tx/${txHash}` : config.explorerUrl;
  },
  
  getContractAddress: (contractName) => {
    const config = getCurrentConfig();
    return config.contracts[contractName];
  },
  
  getTreasuryWallet: (network, token) => {
    const config = getCurrentConfig();
    return config.treasuries[network]?.[token];
  },
  
  // Network configuration for MetaMask
  getNetworkConfig: () => {
    const config = getCurrentConfig();
    return {
      chainId: `0x${config.chainId.toString(16)}`,
      chainName: config.networkName,
      nativeCurrency: config.nativeCurrency,
      rpcUrls: [config.rpcUrl],
      blockExplorerUrls: [config.explorerUrl]
    };
  }
};

// Server deployment instructions
console.log(`
🚀 BrainArk DApp Server Configuration
=====================================

📋 DEPLOYMENT CHECKLIST:

1. 🌐 SERVER SETUP:
   - Deploy to your public server (brainark.online)
   - Configure SSL certificates for HTTPS
   - Set up domain DNS records
   - Configure firewall and security

2. 🔧 ENVIRONMENT VARIABLES:
   - Copy .env.local to your server
   - Update NEXT_PUBLIC_NETWORK_ENV=production
   - Update NEXT_PUBLIC_RPC_URL=https://rpc.brainark.online
   - Update NEXTAUTH_URL=https://brainark.online

3. 📦 BUILD & DEPLOY:
   - npm run build
   - Deploy build files to server
   - Start production server
   - Test all functionality

4. 🔗 NETWORK CONFIGURATION:
   - Ensure BrainArk RPC is accessible
   - Configure load balancer if needed
   - Set up monitoring and logging

5. 🧪 TESTING:
   - Test wallet connections
   - Test EPO purchases
   - Test airdrop participation
   - Test treasury routing

6. 📊 MONITORING:
   - Set up server monitoring
   - Monitor contract interactions
   - Track treasury balances
   - Monitor user activity

Current Environment: ${process.env.NODE_ENV || 'development'}
Network Environment: ${process.env.NEXT_PUBLIC_NETWORK_ENV || 'development'}
`);

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports.default = getCurrentConfig();
}