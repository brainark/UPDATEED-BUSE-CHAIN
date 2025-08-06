// Network Configuration
export const NETWORK_CONFIGS = {
  // Local Development (Hardhat/Ganache)
  local: {
    RPC_URL: "http://localhost:8545",
    CHAIN_ID: "0x7a69", // 31337
    CHAIN_ID_DECIMAL: 31337,
    CHAIN_NAME: "BrainArk Local",
    CURRENCY_NAME: "Ethereum",
    CURRENCY_SYMBOL: "ETH",
    CURRENCY_DECIMALS: 18,
    EXPLORER_URL: "http://localhost:3000",
  },
  
  // Production BrainArk Network
  production: {
    RPC_URL: "https://rpc.brainark.online",
    CHAIN_ID: "0x67932", // 424242
    CHAIN_ID_DECIMAL: 424242,
    CHAIN_NAME: "BrainArk",
    CURRENCY_NAME: "BrainArk Token",
    CURRENCY_SYMBOL: "BAK",
    CURRENCY_DECIMALS: 18,
    EXPLORER_URL: "https://explorer.brainark.online",
  }
};

// Auto-detect environment or allow manual override
const getNetworkConfig = () => {
  // Check if we're in development mode
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('localhost');
  
  // You can also check for a specific environment variable or URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const networkOverride = urlParams.get('network');
  
  if (networkOverride === 'local') {
    return NETWORK_CONFIGS.local;
  } else if (networkOverride === 'production' || !isDevelopment) {
    return NETWORK_CONFIGS.production;
  }
  
  // Default to production for deployed version, local for development
  return isDevelopment ? NETWORK_CONFIGS.local : NETWORK_CONFIGS.production;
};

// Function to switch network configuration
export const switchNetworkConfig = (networkKey) => {
  if (NETWORK_CONFIGS[networkKey]) {
    return NETWORK_CONFIGS[networkKey];
  }
  return getNetworkConfig();
};

export const CURRENT_NETWORK = getNetworkConfig();

// Export individual values for backward compatibility
export const RPC_URL = CURRENT_NETWORK.RPC_URL;
export const CHAIN_ID = CURRENT_NETWORK.CHAIN_ID;
export const CHAIN_NAME = CURRENT_NETWORK.CHAIN_NAME;
export const RPCS = { [CURRENT_NETWORK.CHAIN_ID_DECIMAL]: CURRENT_NETWORK.RPC_URL };
export const EXPLORER_URL = CURRENT_NETWORK.EXPLORER_URL;