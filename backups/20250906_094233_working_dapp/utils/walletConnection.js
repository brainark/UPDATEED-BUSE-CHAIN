// Enhanced MetaMask connection utility based on working explorer code
export class WalletConnection {
  constructor() {
    this.web3 = null;
    this.currentProvider = null;
    this.walletType = null;
    this.isConnecting = false;
    this.connectionTimeout = 15000; // 15 seconds timeout
  }

  // BrainArk Network Configuration
  getBrainArkNetworkConfig() {
    return {
      chainId: '0x539', // 1337 in hex (local development)
      chainName: 'BrainArk Besu Network',
      rpcUrls: ['http://localhost:8545'],
      nativeCurrency: {
        name: 'BAK',
        symbol: 'BAK',
        decimals: 18,
      },
      blockExplorerUrls: ['http://localhost:3001'],
    };
  }

  // Check if MetaMask is installed
  isMetaMaskInstalled() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  // Add BrainArk network to MetaMask
  async addBrainArkNetwork() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    const networkConfig = this.getBrainArkNetworkConfig();
    
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkConfig],
      });
      return true;
    } catch (error) {
      console.error('Failed to add BrainArk network:', error);
      throw new Error(`Failed to add BrainArk network: ${error.message}`);
    }
  }

  // Switch to BrainArk network
  async switchToBrainArkNetwork() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: this.getBrainArkNetworkConfig().chainId }],
      });
      return true;
    } catch (error) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        return await this.addBrainArkNetwork();
      }
      throw error;
    }
  }

  // Connect to MetaMask with improved error handling
  async connectMetaMask() {
    if (this.isConnecting) {
      throw new Error('Connection already in progress');
    }

    this.isConnecting = true;

    try {
      if (!this.isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask extension.');
      }

      // Check if already connected
      const existingAccounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });

      if (existingAccounts.length > 0) {
        console.log('Already connected to:', existingAccounts[0]);
        await this.switchToBrainArkNetwork();
        return {
          success: true,
          address: existingAccounts[0],
          message: 'Already connected'
        };
      }

      // Request connection with timeout
      const accounts = await Promise.race([
        window.ethereum.request({ method: 'eth_requestAccounts' }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), this.connectionTimeout)
        )
      ]);

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      // Add/switch to BrainArk network
      await this.switchToBrainArkNetwork();

      // Verify connection
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('Connected to chain:', chainId);

      return {
        success: true,
        address: accounts[0],
        chainId: chainId,
        message: 'Successfully connected to MetaMask'
      };

    } catch (error) {
      console.error('MetaMask connection error:', error);
      
      let errorMessage = 'Failed to connect to MetaMask';
      
      if (error.code === 4001) {
        errorMessage = 'Please approve the connection request in MetaMask';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Connection timeout. Please try again.';
      } else if (error.message.includes('not installed')) {
        errorMessage = 'MetaMask is not installed. Please install MetaMask extension.';
      } else {
        errorMessage = error.message || errorMessage;
      }

      return {
        success: false,
        error: errorMessage,
        code: error.code
      };
    } finally {
      this.isConnecting = false;
    }
  }

  // Get current account
  async getCurrentAccount() {
    if (!this.isMetaMaskInstalled()) {
      return null;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      console.error('Error getting current account:', error);
      return null;
    }
  }

  // Check if connected to BrainArk network
  async isConnectedToBrainArk() {
    if (!this.isMetaMaskInstalled()) {
      return false;
    }

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      return chainId === this.getBrainArkNetworkConfig().chainId;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  }

  // Setup event listeners
  setupEventListeners(onAccountsChanged, onChainChanged) {
    if (!this.isMetaMaskInstalled()) {
      return;
    }

    // Remove existing listeners
    if (window.ethereum.removeAllListeners) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }

    // Add new listeners
    window.ethereum.on('accountsChanged', (accounts) => {
      console.log('Accounts changed:', accounts);
      if (onAccountsChanged) {
        onAccountsChanged(accounts);
      }
    });

    window.ethereum.on('chainChanged', (chainId) => {
      console.log('Chain changed:', chainId);
      if (onChainChanged) {
        onChainChanged(chainId);
      }
      // Reload page on chain change to avoid issues
      window.location.reload();
    });
  }

  // Cleanup event listeners
  cleanup() {
    if (this.isMetaMaskInstalled() && window.ethereum.removeAllListeners) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
  }

  // Get network info
  async getNetworkInfo() {
    if (!this.isMetaMaskInstalled()) {
      return null;
    }

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      return {
        chainId,
        accounts,
        isConnected: accounts.length > 0,
        isBrainArk: chainId === this.getBrainArkNetworkConfig().chainId
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      return null;
    }
  }
}

// Export singleton instance
export const walletConnection = new WalletConnection();