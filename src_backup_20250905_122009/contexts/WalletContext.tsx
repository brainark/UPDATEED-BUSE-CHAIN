import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import Web3 from 'web3'

interface WalletContextType {
  isConnected: boolean
  address: string
  web3: Web3 | null
  chainId: string | null
  balance: string
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchNetwork: () => Promise<void>
  isCorrectNetwork: boolean
  loading: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
}

// Network configuration
const BRAINARK_NETWORK = {
  chainId: '0x67932', // 424242 in hex
  chainName: 'BrainArk Besu Network',
  nativeCurrency: {
    name: 'BrainArk',
    symbol: 'BAK',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.brainark.online'],
  blockExplorerUrls: ['https://explorer.brainark.online'],
}

const LOCAL_NETWORK = {
  chainId: '0x67932', // 424242 in hex
  chainName: 'BrainArk Besu Network (Local)',
  nativeCurrency: {
    name: 'BrainArk',
    symbol: 'BAK',
    decimals: 18,
  },
  rpcUrls: ['http://localhost:8545'],
  blockExplorerUrls: ['http://localhost:3001'],
}

const getNetworkConfig = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    return hostname === 'localhost' || hostname === '127.0.0.1' ? LOCAL_NETWORK : BRAINARK_NETWORK
  }
  return BRAINARK_NETWORK
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState('')
  const [web3, setWeb3] = useState<Web3 | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [balance, setBalance] = useState('0')
  const [loading, setLoading] = useState(false)

  const networkConfig = getNetworkConfig()
  const isCorrectNetwork = chainId?.toLowerCase() === networkConfig.chainId.toLowerCase()

  // Get MetaMask provider
  const getMetaMaskProvider = () => {
    if (typeof window.ethereum === 'undefined') {
      return null
    }

    if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
      const metamaskProvider = window.ethereum.providers.find((provider: any) => provider.isMetaMask)
      if (metamaskProvider) {
        return metamaskProvider
      }
    }

    if (window.ethereum.isMetaMask) {
      return window.ethereum
    }

    return window.ethereum
  }

  // Add/Switch to BrainArk network
  const addBrainArkNetwork = async (provider: any) => {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }],
      })
      return true
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          })
          return true
        } catch (addError: any) {
          console.error('Failed to add network:', addError)
          return false
        }
      }
      return false
    }
  }

  // Connect wallet
  const connectWallet = async () => {
    const provider = getMetaMaskProvider()
    
    if (!provider) {
      alert('MetaMask not detected. Please install MetaMask extension.')
      return
    }

    setLoading(true)

    try {
      // Request account access
      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      
      if (!accounts || accounts.length === 0) {
        alert('No accounts found. Please unlock MetaMask.')
        return
      }

      const account = accounts[0]
      setAddress(account)
      setIsConnected(true)

      // Create Web3 instance
      const web3Instance = new Web3(provider)
      setWeb3(web3Instance)

      // Get current chain ID
      const currentChainId = await provider.request({ method: 'eth_chainId' })
      setChainId(currentChainId)

      // Get balance
      try {
        const balanceWei = await web3Instance.eth.getBalance(account)
        const balanceEth = web3Instance.utils.fromWei(balanceWei, 'ether')
        setBalance(parseFloat(balanceEth).toFixed(4))
      } catch (balanceError) {
        console.error('Error getting balance:', balanceError)
        setBalance('0')
      }

      // Check if on correct network, if not, try to switch
      if (currentChainId.toLowerCase() !== networkConfig.chainId.toLowerCase()) {
        await addBrainArkNetwork(provider)
      }

    } catch (error: any) {
      console.error('Wallet connection error:', error)
      if (error.code === 4001) {
        alert('Connection rejected by user')
      } else if (error.code === -32002) {
        alert('MetaMask is already processing a request. Please check MetaMask.')
      } else {
        alert('Failed to connect wallet. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    setIsConnected(false)
    setAddress('')
    setWeb3(null)
    setChainId(null)
    setBalance('0')
  }

  // Switch network
  const switchNetwork = async () => {
    const provider = getMetaMaskProvider()
    if (!provider) return

    setLoading(true)
    try {
      await addBrainArkNetwork(provider)
      // Update chain ID after switching
      const newChainId = await provider.request({ method: 'eth_chainId' })
      setChainId(newChainId)
    } catch (error) {
      console.error('Network switch error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Update balance
  const updateBalance = async () => {
    if (web3 && address && isCorrectNetwork) {
      try {
        const balanceWei = await web3.eth.getBalance(address)
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether')
        setBalance(parseFloat(balanceEth).toFixed(4))
      } catch (error) {
        console.error('Error updating balance:', error)
      }
    }
  }

  // Listen for account and network changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else if (accounts[0] !== address) {
          setAddress(accounts[0])
          updateBalance()
        }
      }

      const handleChainChanged = (newChainId: string) => {
        setChainId(newChainId)
        updateBalance()
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [address])

  // Update balance periodically
  useEffect(() => {
    if (isConnected && isCorrectNetwork) {
      updateBalance()
      const interval = setInterval(updateBalance, 30000) // Update every 30 seconds
      return () => clearInterval(interval)
    }
  }, [isConnected, isCorrectNetwork, web3, address])

  const value: WalletContextType = {
    isConnected,
    address,
    web3,
    chainId,
    balance,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    isCorrectNetwork,
    loading,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}