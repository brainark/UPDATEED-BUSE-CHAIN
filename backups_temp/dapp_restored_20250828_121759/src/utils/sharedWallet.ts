import { useState, useEffect, createContext, useContext } from 'react'
import Web3 from 'web3'

// Network Configuration (shared with react-explorer)
export const NETWORK_CONFIGS = {
  local: {
    RPC_URL: "http://localhost:8545",
    CHAIN_ID: "0x539", // 1337 for BrainArk local
    CHAIN_ID_DECIMAL: 1337,
    CHAIN_NAME: "BrainArk Besu Network (Local)",
    CURRENCY_NAME: "BrainArk Token",
    CURRENCY_SYMBOL: "BAK",
    CURRENCY_DECIMALS: 18,
    EXPLORER_URL: "http://localhost:3001",
  },
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
}

// Auto-detect environment
const getNetworkConfig = () => {
  const isDevelopment = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.port === '3000' ||
    window.location.port === '3002'
  )
  
  return isDevelopment ? NETWORK_CONFIGS.local : NETWORK_CONFIGS.production
}

export const CURRENT_NETWORK = getNetworkConfig()

// Wallet Connection Interface
export interface WalletState {
  isConnected: boolean
  address: string
  balance: string
  chainId: string
  isCorrectNetwork: boolean
  web3: Web3 | null
}

export interface WalletActions {
  connectWallet: () => Promise<void>
  disconnect: () => void
  switchNetwork: () => Promise<void>
  checkConnection: () => Promise<void>
}

// Shared Wallet Hook
export const useSharedWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: '',
    balance: '0',
    chainId: '',
    isCorrectNetwork: false,
    web3: null
  })

  const [loading, setLoading] = useState(false)

  // Initialize Web3
  useEffect(() => {
    const web3 = new Web3(new Web3.providers.HttpProvider(CURRENT_NETWORK.RPC_URL))
    setWalletState(prev => ({ ...prev, web3 }))
  }, [])

  // Check connection on mount
  useEffect(() => {
    checkConnection()
    
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const checkConnection = async () => {
    if (typeof window === 'undefined' || !window.ethereum) return

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts.length > 0) {
        const address = accounts[0]
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        })
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })
        
        setWalletState(prev => ({
          ...prev,
          isConnected: true,
          address,
          balance: (parseInt(balance, 16) / 1e18).toFixed(4),
          chainId,
          isCorrectNetwork: chainId === CURRENT_NETWORK.CHAIN_ID
        }))
      }
    } catch (error) {
      console.error('Error checking connection:', error)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setWalletState(prev => ({
        ...prev,
        isConnected: false,
        address: '',
        balance: '0',
        chainId: '',
        isCorrectNetwork: false
      }))
    } else {
      checkConnection()
    }
  }

  const handleChainChanged = (chainId: string) => {
    setWalletState(prev => ({
      ...prev,
      chainId,
      isCorrectNetwork: chainId === CURRENT_NETWORK.CHAIN_ID
    }))
    checkConnection()
  }

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.')
    }

    setLoading(true)
    try {
      // Clear any pending requests first
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      
      if (accounts.length > 0) {
        await checkConnection()
      }
    } catch (error: any) {
      if (error.code === -32002) {
        throw new Error('Please check MetaMask - there may be a pending request.')
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  const disconnect = () => {
    setWalletState(prev => ({
      ...prev,
      isConnected: false,
      address: '',
      balance: '0',
      chainId: '',
      isCorrectNetwork: false
    }))
  }

  const switchNetwork = async () => {
    if (typeof window === 'undefined' || !window.ethereum) return

    try {
      // Clear any pending requests first
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CURRENT_NETWORK.CHAIN_ID }],
      })
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: CURRENT_NETWORK.CHAIN_ID,
              chainName: CURRENT_NETWORK.CHAIN_NAME,
              nativeCurrency: {
                name: CURRENT_NETWORK.CURRENCY_NAME,
                symbol: CURRENT_NETWORK.CURRENCY_SYMBOL,
                decimals: CURRENT_NETWORK.CURRENCY_DECIMALS,
              },
              rpcUrls: [CURRENT_NETWORK.RPC_URL],
              blockExplorerUrls: [CURRENT_NETWORK.EXPLORER_URL],
            }],
          })
        } catch (addError) {
          console.error('Failed to add network:', addError)
          throw addError
        }
      } else if (switchError.code === -32002) {
        throw new Error('Please check MetaMask - there may be a pending request.')
      } else {
        throw switchError
      }
    }
  }

  return {
    ...walletState,
    loading,
    connectWallet,
    disconnect,
    switchNetwork,
    checkConnection,
    networkConfig: CURRENT_NETWORK
  }
}

// Utility functions
export const formatAddress = (address: string): string => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const copyToClipboard = async (text: string): Promise<void> => {
  if (typeof window !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }
}