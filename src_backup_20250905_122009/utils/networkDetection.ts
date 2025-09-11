// Enhanced Network Detection and MetaMask Utilities
// Based on react-explorer functionality with improvements

export interface NetworkConfig {
  CHAIN_ID: string
  CHAIN_ID_DECIMAL: number
  CHAIN_NAME: string
  RPC_URL: string
  CURRENCY_SYMBOL: string
  CURRENCY_NAME: string
  CURRENCY_DECIMALS: number
  BLOCK_EXPLORER_URL: string
}

export const NETWORK_CONFIGS = {
  local: {
    CHAIN_ID: '0x539', // 1337 in hex
    CHAIN_ID_DECIMAL: 1337,
    CHAIN_NAME: 'BrainArk Besu Network (Local)',
    RPC_URL: 'http://localhost:8545',
    CURRENCY_SYMBOL: 'BAK',
    CURRENCY_NAME: 'BrainArk Token',
    CURRENCY_DECIMALS: 18,
    BLOCK_EXPLORER_URL: 'http://localhost:3001'
  },
  production: {
    CHAIN_ID: '0x7A69', // 31337 in hex
    CHAIN_ID_DECIMAL: 31337,
    CHAIN_NAME: 'BrainArk Besu Network',
    RPC_URL: 'https://rpc.brainark.online',
    CURRENCY_SYMBOL: 'BAK',
    CURRENCY_NAME: 'BrainArk Token',
    CURRENCY_DECIMALS: 18,
    BLOCK_EXPLORER_URL: 'https://explorer.brainark.online'
  }
} as const

export class NetworkDetector {
  private currentNetwork: 'local' | 'production' = 'local'
  private listeners: Array<(event: any) => void> = []

  constructor() {
    this.detectNetwork()
  }

  // Detect current network environment
  detectNetwork(): 'local' | 'production' {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const port = window.location.port
      
      // Check if we're on localhost or development environment
      if (hostname === 'localhost' || hostname === '127.0.0.1' || port === '3000' || port === '3001') {
        this.currentNetwork = 'local'
      } else {
        this.currentNetwork = 'production'
      }
    }
    
    return this.currentNetwork
  }

  // Get current network configuration
  getCurrentNetworkConfig(): NetworkConfig {
    return NETWORK_CONFIGS[this.currentNetwork]
  }

  // Check if MetaMask is connected to the correct network
  async checkNetworkMatch(): Promise<{
    isCorrect: boolean
    error?: string
    currentChainId?: string
    expectedChainId?: string
    currentNetwork?: string
  }> {
    if (!window.ethereum) {
      return { isCorrect: false, error: 'MetaMask not installed' }
    }

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      const expectedChainId = this.getCurrentNetworkConfig().CHAIN_ID
      
      return {
        isCorrect: chainId === expectedChainId,
        currentChainId: chainId,
        expectedChainId: expectedChainId,
        currentNetwork: this.currentNetwork
      }
    } catch (error: any) {
      return { isCorrect: false, error: error.message }
    }
  }

  // Switch MetaMask to the correct network
  async switchToCorrectNetwork(): Promise<boolean> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed')
    }

    const config = this.getCurrentNetworkConfig()

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: config.CHAIN_ID }],
      })
      return true
    } catch (switchError: any) {
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
          })
          return true
        } catch (addError: any) {
          throw new Error(`Failed to add network: ${addError.message}`)
        }
      } else {
        throw new Error(`Failed to switch network: ${switchError.message}`)
      }
    }
  }

  // Enhanced MetaMask connection with network detection
  async connectMetaMask(): Promise<{
    success: boolean
    account?: string
    network?: string
    networkConfig?: NetworkConfig
    error?: string
  }> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask extension first.')
    }

    try {
      // First, detect and set the correct network
      this.detectNetwork()

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.')
      }

      // Check if we're on the correct network
      const networkCheck = await this.checkNetworkMatch()
      
      if (!networkCheck.isCorrect) {
        // Attempt to switch to the correct network
        await this.switchToCorrectNetwork()
      }

      return {
        success: true,
        account: accounts[0],
        network: this.currentNetwork,
        networkConfig: this.getCurrentNetworkConfig()
      }

    } catch (error: any) {
      console.error('MetaMask connection error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get network status for display
  async getNetworkStatus(): Promise<{
    connected: boolean
    text: string
    showSwitchButton: boolean
    currentChainId?: string
    expectedChainId?: string
  }> {
    if (!window.ethereum) {
      return {
        connected: false,
        text: 'MetaMask not installed',
        showSwitchButton: false
      }
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      const expectedChainId = this.getCurrentNetworkConfig().CHAIN_ID

      if (accounts.length === 0) {
        return {
          connected: false,
          text: 'MetaMask not connected',
          showSwitchButton: false
        }
      }

      if (chainId !== expectedChainId) {
        return {
          connected: false,
          text: `Wrong network (${chainId}). Expected ${expectedChainId}`,
          showSwitchButton: true,
          currentChainId: chainId,
          expectedChainId: expectedChainId
        }
      }

      return {
        connected: true,
        text: `Connected to ${this.getCurrentNetworkConfig().CHAIN_NAME}`,
        showSwitchButton: false,
        currentChainId: chainId,
        expectedChainId: expectedChainId
      }

    } catch (error: any) {
      return {
        connected: false,
        text: `Error: ${error.message}`,
        showSwitchButton: false
      }
    }
  }

  // Add event listener for network changes
  onNetworkChange(callback: (event: any) => void): void {
    this.listeners.push(callback)
    
    if (window.ethereum) {
      window.ethereum.on('chainChanged', (chainId: string) => {
        this.listeners.forEach(listener => listener({ type: 'chainChanged', chainId }))
      })

      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        this.listeners.forEach(listener => listener({ type: 'accountsChanged', accounts }))
      })
    }
  }

  // Remove event listeners
  removeListeners(): void {
    if (window.ethereum) {
      window.ethereum.removeAllListeners('chainChanged')
      window.ethereum.removeAllListeners('accountsChanged')
    }
    this.listeners = []
  }

  // Validate transaction parameters for current network
  validateTransaction(txParams: any): {
    isValid: boolean
    gasPrice?: string
    gasLimit?: string
    chainId?: number
  } {
    const config = this.getCurrentNetworkConfig()
    
    return {
      isValid: true,
      gasPrice: txParams.gasPrice || '20000000000', // 20 gwei default
      gasLimit: txParams.gasLimit || '21000',
      chainId: config.CHAIN_ID_DECIMAL
    }
  }

  // Get recommended gas settings for current network
  getGasSettings(): {
    gasPrice: string
    gasLimit: string
    maxFeePerGas: string
    maxPriorityFeePerGas: string
  } {
    const config = this.getCurrentNetworkConfig()
    
    if (config.CHAIN_ID_DECIMAL === 1337) {
      // Local network - lower gas settings
      return {
        gasPrice: '1000000000', // 1 gwei
        gasLimit: '21000',
        maxFeePerGas: '2000000000', // 2 gwei
        maxPriorityFeePerGas: '1000000000' // 1 gwei
      }
    } else {
      // Production network - standard gas settings
      return {
        gasPrice: '20000000000', // 20 gwei
        gasLimit: '21000',
        maxFeePerGas: '40000000000', // 40 gwei
        maxPriorityFeePerGas: '2000000000' // 2 gwei
      }
    }
  }
}

// Create singleton instance
export const networkDetector = new NetworkDetector()

// Utility functions for easy access
export const connectMetaMask = () => networkDetector.connectMetaMask()
export const getNetworkStatus = () => networkDetector.getNetworkStatus()
export const switchToCorrectNetwork = () => networkDetector.switchToCorrectNetwork()
export const getCurrentNetworkConfig = () => networkDetector.getCurrentNetworkConfig()
export const checkNetworkMatch = () => networkDetector.checkNetworkMatch()

// Export for backward compatibility
export default networkDetector