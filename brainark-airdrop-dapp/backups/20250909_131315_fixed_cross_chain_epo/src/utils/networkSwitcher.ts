// Enhanced network switching utility for BrainArk dApp
import { brainarkChain } from './wagmiConfig'

export interface NetworkSwitchResult {
  success: boolean
  error?: string
  userRejected?: boolean
}

export class NetworkSwitcher {
  private static instance: NetworkSwitcher
  private switchingInProgress = false

  static getInstance(): NetworkSwitcher {
    if (!NetworkSwitcher.instance) {
      NetworkSwitcher.instance = new NetworkSwitcher()
    }
    return NetworkSwitcher.instance
  }

  private async getProvider() {
    if (typeof window === 'undefined' || !window.ethereum) {
      return null
    }
    
    let provider = window.ethereum
    
    // Handle multiple providers (like when both MetaMask and other wallets are installed)
    if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
      const metamaskProvider = window.ethereum.providers.find((p: any) => p.isMetaMask)
      if (metamaskProvider) {
        provider = metamaskProvider
      }
    }
    
    return provider
  }

  private async testNetworkConnectivity(): Promise<boolean> {
    try {
      const response = await fetch(brainarkChain.rpcUrls.default.http[0], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        }),
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      
      if (!response.ok) return false
      
      const data = await response.json()
      return !!data.result
    } catch (error) {
      console.warn('Network connectivity test failed:', error)
      return false
    }
  }

  async switchToBrainArkNetwork(): Promise<NetworkSwitchResult> {
    if (this.switchingInProgress) {
      return { success: false, error: 'Network switch already in progress' }
    }

    const provider = await this.getProvider()
    if (!provider) {
      return { success: false, error: 'No Ethereum provider found. Please install MetaMask.' }
    }

    this.switchingInProgress = true

    try {
      // Test network connectivity first
      const isNetworkOnline = await this.testNetworkConnectivity()
      if (!isNetworkOnline) {
        return { 
          success: false, 
          error: 'BrainArk network is not accessible. Please ensure the blockchain is running.' 
        }
      }

      // Try to switch to existing network first
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${brainarkChain.id.toString(16)}` }],
        })
        return { success: true }
      } catch (switchError: any) {
        // If network doesn't exist (error 4902), add it
        if (switchError.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${brainarkChain.id.toString(16)}`,
              chainName: brainarkChain.name,
              nativeCurrency: brainarkChain.nativeCurrency,
              rpcUrls: brainarkChain.rpcUrls.default.http,
              blockExplorerUrls: [brainarkChain.blockExplorers.default.url],
            }],
          })
          return { success: true }
        } else {
          throw switchError
        }
      }
    } catch (error: any) {
      console.error('Network switch failed:', error)
      
      // Handle specific error codes
      if (error.code === 4001) {
        return { success: false, error: 'User rejected the network switch', userRejected: true }
      } else if (error.code === -32002) {
        return { success: false, error: 'Request already pending in MetaMask. Please check MetaMask.' }
      } else if (error.message?.includes('already pending')) {
        return { success: false, error: 'Request already pending. Please check your wallet.' }
      } else {
        return { success: false, error: `Failed to switch network: ${error.message || 'Unknown error'}` }
      }
    } finally {
      this.switchingInProgress = false
    }
  }

  async getCurrentChainId(): Promise<number | null> {
    const provider = await this.getProvider()
    if (!provider) return null

    try {
      const chainId = await provider.request({ method: 'eth_chainId' })
      return parseInt(chainId, 16)
    } catch (error) {
      console.error('Error getting chain ID:', error)
      return null
    }
  }

  async isOnBrainArkNetwork(): Promise<boolean> {
    const currentChainId = await this.getCurrentChainId()
    return currentChainId === brainarkChain.id
  }

  // Show user-friendly prompt to switch networks
  showNetworkSwitchPrompt(): Promise<boolean> {
    return new Promise((resolve) => {
      const modal = document.createElement('div')
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]'
      
      // Create modal content safely using DOM methods
      const modalContent = document.createElement('div')
      modalContent.className = 'bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md mx-4 shadow-2xl'
      
      const textCenter = document.createElement('div')
      textCenter.className = 'text-center mb-4'
      
      const emoji = document.createElement('div')
      emoji.className = 'text-4xl mb-2'
      emoji.textContent = '🌐'
      
      const title = document.createElement('h3')
      title.className = 'text-lg font-bold text-gray-900 dark:text-white mb-2'
      title.textContent = 'Switch to BrainArk Network'
      
      const description = document.createElement('p')
      description.className = 'text-sm text-gray-600 dark:text-gray-300'
      description.textContent = 'This dApp requires the BrainArk network to function properly. Would you like to switch now?'
      
      const buttonContainer = document.createElement('div')
      buttonContainer.className = 'flex gap-3'
      
      const yesButton = document.createElement('button')
      yesButton.className = 'flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors'
      yesButton.textContent = 'Yes, Switch Network'
      
      const noButton = document.createElement('button')
      noButton.className = 'flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors'
      noButton.textContent = 'Cancel'
      
      // Assemble the modal structure
      textCenter.appendChild(emoji)
      textCenter.appendChild(title)
      textCenter.appendChild(description)
      
      buttonContainer.appendChild(yesButton)
      buttonContainer.appendChild(noButton)
      
      modalContent.appendChild(textCenter)
      modalContent.appendChild(buttonContainer)
      
      modal.appendChild(modalContent)
      document.body.appendChild(modal)
      
      const cleanup = () => {
        document.body.removeChild(modal)
      }
      
      yesButton.addEventListener('click', () => {
        cleanup()
        resolve(true)
      })
      
      noButton.addEventListener('click', () => {
        cleanup()
        resolve(false)
      })
      
      // Close on backdrop click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          cleanup()
          resolve(false)
        }
      })
    })
  }

  // Check and auto-prompt network switch if needed
  async checkAndPromptNetworkSwitch(autoPrompt = true): Promise<NetworkSwitchResult> {
    const isOnCorrectNetwork = await this.isOnBrainArkNetwork()
    
    if (isOnCorrectNetwork) {
      return { success: true }
    }
    
    if (!autoPrompt) {
      return { success: false, error: 'Wrong network' }
    }
    
    const shouldSwitch = await this.showNetworkSwitchPrompt()
    if (!shouldSwitch) {
      return { success: false, error: 'User declined network switch', userRejected: true }
    }
    
    return await this.switchToBrainArkNetwork()
  }
}

// Export singleton instance for easy access
export const networkSwitcher = NetworkSwitcher.getInstance()

// Helper function for components
export async function ensureBrainArkNetwork(showPrompt = true): Promise<boolean> {
  const result = await networkSwitcher.checkAndPromptNetworkSwitch(showPrompt)
  return result.success
}

export default networkSwitcher