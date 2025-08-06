// Network Detection and MetaMask Utilities
// Based on react-explorer functionality

export const NETWORK_CONFIGS = {
  local: {
    CHAIN_ID: '0x67932', // 424242 in hex
    CHAIN_ID_DECIMAL: 424242,
    CHAIN_NAME: 'BrainArk Besu Network (Local)',
    RPC_URL: 'http://localhost:8545',
    CURRENCY_SYMBOL: 'BAK',
    CURRENCY_NAME: 'BrainArk Token',
    CURRENCY_DECIMALS: 18,
    BLOCK_EXPLORER_URL: 'http://localhost:3001'
  },
  production: {
    CHAIN_ID: '0x67932', // 424242 in hex
    CHAIN_ID_DECIMAL: 424242,
    CHAIN_NAME: 'BrainArk Besu Network',
    RPC_URL: 'https://rpc.brainark.online',
    CURRENCY_SYMBOL: 'BAK',
    CURRENCY_NAME: 'BrainArk Token',
    CURRENCY_DECIMALS: 18,
    BLOCK_EXPLORER_URL: 'https://explorer.brainark.online'
  }
};

export class NetworkDetector {
  constructor() {
    this.currentNetwork = 'local'; // Default to local
    this.listeners = [];
  }

  // Detect current network environment
  detectNetwork() {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Check if we're on localhost or development environment
    if (hostname === 'localhost' || hostname === '127.0.0.1' || port === '3000' || port === '3001') {
      this.currentNetwork = 'local';
    } else {
      this.currentNetwork = 'production';
    }
    
    return this.currentNetwork;
  }

  // Get current network configuration
  getCurrentNetworkConfig() {
    return NETWORK_CONFIGS[this.currentNetwork];
  }

  // Check if MetaMask is connected to the correct network
  async checkNetworkMatch() {
    if (!window.ethereum) {
      return { isCorrect: false, error: 'MetaMask not installed' };
    }

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const expectedChainId = this.getCurrentNetworkConfig().CHAIN_ID;
      
      return {
        isCorrect: chainId === expectedChainId,
        currentChainId: chainId,
        expectedChainId: expectedChainId,
        currentNetwork: this.currentNetwork
      };
    } catch (error) {
      return { isCorrect: false, error: error.message };
    }
  }

  // Switch MetaMask to the correct network
  async switchToCorrectNetwork() {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    const config = this.getCurrentNetworkConfig();

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: config.CHAIN_ID }],
      });
      return true;
    } catch (switchError) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: config.CHAIN_ID,
              chainName: config.CHAIN_NAME,
              nativeCurrency: {
                name: config.CURRENCY_NAME,
                symbol: config.CURRENCY_SYMBOL,
                decimals: config.CURRENCY_DECIMALS,
              },
              rpcUrls: [config.RPC_URL],
              blockExplorerUrls: [config.BLOCK_EXPLORER_URL],
            }],
          });
          return true;
        } catch (addError) {
          throw new Error(`Failed to add network: ${addError.message}`);
        }
      } else {
        throw new Error(`Failed to switch network: ${switchError.message}`);
      }
    }
  }

  // Enhanced MetaMask connection with network detection
  async connectMetaMask() {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask extension first.');
    }

    try {
      // First, detect and set the correct network
      this.detectNetwork();

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      // Check if we're on the correct network
      const networkCheck = await this.checkNetworkMatch();
      
      if (!networkCheck.isCorrect) {
        // Attempt to switch to the correct network
        await this.switchToCorrectNetwork();
      }

      return {
        success: true,
        account: accounts[0],
        network: this.currentNetwork,
        networkConfig: this.getCurrentNetworkConfig()
      };

    } catch (error) {
      console.error('MetaMask connection error:', error);
      throw error;
    }
  }

  // Get network status for display
  async getNetworkStatus() {
    if (!window.ethereum) {
      return {
        connected: false,
        text: 'MetaMask not installed',
        showSwitchButton: false
      };
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const expectedChainId = this.getCurrentNetworkConfig().CHAIN_ID;

      if (accounts.length === 0) {
        return {
          connected: false,
          text: 'MetaMask not connected',
          showSwitchButton: false
        };
      }

      if (chainId !== expectedChainId) {
        return {
          connected: false,
          text: `Wrong network (${chainId}). Expected ${expectedChainId}`,
          showSwitchButton: true,
          currentChainId: chainId,
          expectedChainId: expectedChainId
        };
      }

      return {
        connected: true,
        text: `Connected to ${this.getCurrentNetworkConfig().CHAIN_NAME}`,
        showSwitchButton: false,
        chainId: chainId
      };

    } catch (error) {
      return {
        connected: false,
        text: `Error: ${error.message}`,
        showSwitchButton: false
      };
    }
  }

  // Add event listener for network changes
  onNetworkChange(callback) {
    this.listeners.push(callback);
    
    if (window.ethereum) {
      window.ethereum.on('chainChanged', (chainId) => {
        this.listeners.forEach(listener => listener({ type: 'chainChanged', chainId }));
      });

      window.ethereum.on('accountsChanged', (accounts) => {
        this.listeners.forEach(listener => listener({ type: 'accountsChanged', accounts }));
      });
    }
  }

  // Remove event listeners
  removeListeners() {
    if (window.ethereum) {
      window.ethereum.removeAllListeners('chainChanged');
      window.ethereum.removeAllListeners('accountsChanged');
    }
    this.listeners = [];
  }

  // Validate transaction parameters for current network
  validateTransaction(txParams) {
    const config = this.getCurrentNetworkConfig();
    
    return {
      isValid: true,
      gasPrice: txParams.gasPrice || '20000000000', // 20 gwei default
      gasLimit: txParams.gasLimit || '21000',
      chainId: config.CHAIN_ID_DECIMAL
    };
  }

  // Get recommended gas settings for current network
  getGasSettings() {
    const config = this.getCurrentNetworkConfig();
    
    // BrainArk network uses very low gas prices (1000 wei)
    return {
      gasPrice: '1000', // 1000 wei (matches blockchain config)
      gasLimit: '21000',
      maxFeePerGas: '2000', // 2000 wei
      maxPriorityFeePerGas: '1000' // 1000 wei
    };
  }
}

// Create singleton instance
export const networkDetector = new NetworkDetector();

// Utility functions for easy access
export const connectMetaMask = () => networkDetector.connectMetaMask();
export const getNetworkStatus = () => networkDetector.getNetworkStatus();
export const switchToCorrectNetwork = () => networkDetector.switchToCorrectNetwork();
export const getCurrentNetworkConfig = () => networkDetector.getCurrentNetworkConfig();
export const checkNetworkMatch = () => networkDetector.checkNetworkMatch();

// Export for backward compatibility
export default networkDetector;