// Enhanced Provider Detection Utility
// Handles multiple wallet providers and prioritizes MetaMask

export class ProviderDetector {
  constructor() {
    this.detectedProviders = [];
    this.preferredProvider = null;
    this.cachedProvider = null;
    this.hasLoggedProviders = false;
    this.hasLoggedProvider = false;
    this.isConnecting = false;
  }

  // Get the best MetaMask provider (with caching to prevent repeated logs)
  getMetaMaskProvider() {
    if (typeof window === 'undefined' || !window.ethereum) {
      return null;
    }

    // Cache the provider to avoid repeated detection
    if (this.cachedProvider) {
      return this.cachedProvider;
    }

    let provider = null;

    // Check if there are multiple providers
    if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
      if (!this.hasLoggedProviders) {
        console.log(`Multiple wallet providers detected: ${window.ethereum.providers.length}`);
        this.hasLoggedProviders = true;
      }
      
      // Find MetaMask specifically
      const metamaskProvider = window.ethereum.providers.find(provider => provider.isMetaMask);
      if (metamaskProvider) {
        provider = metamaskProvider;
      }
    }

    // Check if the main ethereum object is MetaMask
    if (!provider && window.ethereum.isMetaMask) {
      provider = window.ethereum;
    }

    // Fallback to main ethereum object
    if (!provider) {
      provider = window.ethereum;
    }

    // Cache the provider
    this.cachedProvider = provider;

    if (!this.hasLoggedProvider && provider) {
      console.log('Found MetaMask provider');
      this.hasLoggedProvider = true;
    }

    return provider;
  }

  // Check if MetaMask is installed
  isMetaMaskInstalled() {
    const provider = this.getMetaMaskProvider();
    return provider !== null && provider.isMetaMask;
  }

  // Get provider info for debugging
  getProviderInfo() {
    if (typeof window === 'undefined' || !window.ethereum) {
      return {
        hasEthereum: false,
        providersCount: 0,
        hasMetaMask: false,
        providers: []
      };
    }

    const info = {
      hasEthereum: true,
      providersCount: window.ethereum.providers ? window.ethereum.providers.length : 1,
      hasMetaMask: this.isMetaMaskInstalled(),
      providers: []
    };

    if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
      info.providers = window.ethereum.providers.map(provider => ({
        isMetaMask: provider.isMetaMask,
        isPhantom: provider.isPhantom,
        isCoinbaseWallet: provider.isCoinbaseWallet,
        name: provider.constructor?.name || 'Unknown'
      }));
    } else {
      info.providers = [{
        isMetaMask: window.ethereum.isMetaMask,
        isPhantom: window.ethereum.isPhantom,
        isCoinbaseWallet: window.ethereum.isCoinbaseWallet,
        name: window.ethereum.constructor?.name || 'Unknown'
      }];
    }

    return info;
  }

  // Setup event listeners with proper provider
  setupEventListeners(onAccountsChanged, onChainChanged) {
    const provider = this.getMetaMaskProvider();
    
    if (!provider) {
      console.warn('No MetaMask provider available for event listeners');
      return () => {}; // Return empty cleanup function
    }

    // Remove existing listeners first
    if (provider.removeAllListeners) {
      provider.removeAllListeners('accountsChanged');
      provider.removeAllListeners('chainChanged');
    }

    // Add new listeners
    provider.on('accountsChanged', onAccountsChanged);
    provider.on('chainChanged', onChainChanged);

    // Return cleanup function
    return () => {
      if (provider.removeListener) {
        provider.removeListener('accountsChanged', onAccountsChanged);
        provider.removeListener('chainChanged', onChainChanged);
      }
    };
  }

  // Make requests using the correct provider
  async request(method, params = []) {
    const provider = this.getMetaMaskProvider();
    
    if (!provider) {
      throw new Error('MetaMask not installed or not available');
    }

    try {
      return await provider.request({ method, params });
    } catch (error) {
      console.error(`Provider request failed for ${method}:`, error);
      throw error;
    }
  }

  // Connect to MetaMask specifically (with connection state management)
  async connectMetaMask() {
    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting) {
      throw new Error('Already processing eth_requestAccounts. Please wait.');
    }

    const provider = this.getMetaMaskProvider();
    
    if (!provider) {
      throw new Error('MetaMask is not installed. Please install MetaMask extension first.');
    }

    if (!provider.isMetaMask) {
      console.warn('Warning: Using non-MetaMask provider. This may cause unexpected behavior.');
    }

    this.isConnecting = true;

    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      return {
        success: true,
        account: accounts[0],
        provider: provider
      };
    } catch (error) {
      if (error.code === 4001) {
        throw new Error('User rejected the connection request');
      }
      if (error.message.includes('Already processing eth_requestAccounts')) {
        throw new Error('Already processing eth_requestAccounts. Please wait.');
      }
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  // Check current connection status
  async getConnectionStatus() {
    const provider = this.getMetaMaskProvider();
    
    if (!provider) {
      return {
        connected: false,
        account: null,
        chainId: null,
        error: 'MetaMask not installed'
      };
    }

    try {
      const accounts = await provider.request({ method: 'eth_accounts' });
      const chainId = await provider.request({ method: 'eth_chainId' });

      return {
        connected: accounts.length > 0,
        account: accounts[0] || null,
        chainId: chainId,
        error: null
      };
    } catch (error) {
      return {
        connected: false,
        account: null,
        chainId: null,
        error: error.message
      };
    }
  }
}

// Create singleton instance
export const providerDetector = new ProviderDetector();

// Utility functions for easy access
export const getMetaMaskProvider = () => providerDetector.getMetaMaskProvider();
export const isMetaMaskInstalled = () => providerDetector.isMetaMaskInstalled();
export const getProviderInfo = () => providerDetector.getProviderInfo();
export const connectMetaMask = () => providerDetector.connectMetaMask();
export const getConnectionStatus = () => providerDetector.getConnectionStatus();

export default providerDetector;