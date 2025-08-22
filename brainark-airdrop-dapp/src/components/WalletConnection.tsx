import React, { useState, useEffect, useCallback } from 'react'
import Web3 from 'web3'

interface NetworkStatus {
  text: string
  color: string
  connected: boolean
}

interface WalletConnectionProps {
  onWalletConnect?: (address: string, web3: Web3) => void
  onWalletDisconnect?: () => void
  onNetworkChange?: (chainId: string) => void
}

// BrainArk Network Configuration
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

// Local development network
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

// Determine which network to use based on environment
const getNetworkConfig = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    return hostname === 'localhost' || hostname === '127.0.0.1' ? LOCAL_NETWORK : BRAINARK_NETWORK
  }
  return BRAINARK_NETWORK
}

export default function WalletConnection({ onWalletConnect, onWalletDisconnect, onNetworkChange }: WalletConnectionProps) {
  const [walletAddress, setWalletAddress] = useState<string>('Not connected')
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({ text: '', color: '', connected: false })
  const [showSwitchButton, setShowSwitchButton] = useState(false)
  const [web3, setWeb3] = useState<Web3 | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const networkConfig = getNetworkConfig()

  // Function to get the correct MetaMask provider when multiple wallets are installed
  const getMetaMaskProvider = () => {
    if (typeof window.ethereum === 'undefined') {
      return null
    }

    // If there are multiple providers (like MetaMask + Phantom)
    if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
      console.log('Multiple providers detected:', window.ethereum.providers.length)
      // Find MetaMask specifically
      const metamaskProvider = window.ethereum.providers.find((provider: any) => provider.isMetaMask)
      if (metamaskProvider) {
        console.log('Found MetaMask provider')
        return metamaskProvider
      }
    }

    // If it's MetaMask directly
    if (window.ethereum.isMetaMask) {
      console.log('Direct MetaMask provider')
      return window.ethereum
    }

    // Fallback to the main ethereum object
    console.log('Using fallback ethereum provider')
    return window.ethereum
  }

  // Add BrainArk network to MetaMask
  const addBrainArkNetwork = async (provider: any = null) => {
    const ethProvider = provider || getMetaMaskProvider()
    
    if (!ethProvider) {
      console.log('No valid ethereum provider available')
      return false
    }
    
    try {
      console.log('Attempting to switch to network:', networkConfig.chainName, 'Chain ID:', networkConfig.chainId)
      
      // First try to switch to the network if it already exists
      await ethProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }],
      })
      console.log('Successfully switched to', networkConfig.chainName)
      return true
    } catch (switchError: any) {
      console.log('Switch error:', switchError.code)
      
      // If the network doesn't exist (error 4902), add it
      if (switchError.code === 4902) {
        try {
          console.log('Network not found, adding', networkConfig.chainName, '...')
          
          await ethProvider.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          })
          console.log('Successfully added', networkConfig.chainName)
          return true
        } catch (addError: any) {
          console.error('Failed to add network:', addError)
          if (addError.code === -32602) {
            alert(`Network configuration conflict detected. Your MetaMask already has a network using this RPC endpoint. Please use the existing network or change the RPC URL.`)
          } else if (addError.code !== 4001) {
            alert('Failed to add network. Please add it manually in MetaMask.')
          }
          return false
        }
      } else if (switchError.code === -32602) {
        alert('Invalid chain ID. Please check your network configuration.')
        return false
      } else if (switchError.code !== 4001) {
        console.error('Switch error:', switchError)
        return false
      }
    }
    return false
  }

  // Update network status
  const updateNetworkStatus = useCallback(async () => {
    const provider = getMetaMaskProvider()
    
    if (!provider) {
      setNetworkStatus({ text: '🔴 Wallet not detected', color: 'red', connected: false })
      return
    }

    try {
      const currentChainId = await provider.request({ method: 'eth_chainId' })
      console.log('Current chain ID:', currentChainId, 'Expected:', networkConfig.chainId)
      
      if (currentChainId.toLowerCase() === networkConfig.chainId.toLowerCase()) {
        setNetworkStatus({ text: `🟢 Connected to ${networkConfig.chainName}`, color: 'green', connected: true })
        setShowSwitchButton(false)
        onNetworkChange?.(currentChainId)
      } else {
        setNetworkStatus({ 
          text: `🔴 Wrong network (Current: ${currentChainId}, Expected: ${networkConfig.chainId})`, 
          color: 'red', 
          connected: false 
        })
        setShowSwitchButton(true)
      }
    } catch (err) {
      console.error('Error updating network status:', err)
      setNetworkStatus({ text: '🔴 Unable to fetch network info', color: 'red', connected: false })
    }
  }, [networkConfig.chainId, networkConfig.chainName, onNetworkChange])

  // Switch to BrainArk network
  const switchToBrainArk = async () => {
    try {
      const success = await addBrainArkNetwork()
      if (success) {
        await updateNetworkStatus()
      }
    } catch (err) {
      console.error('Error switching to BrainArk:', err)
    }
  }

  // Connect to MetaMask
  const connectMetaMask = async () => {
    const provider = getMetaMaskProvider()
    
    if (!provider) {
      alert('MetaMask not detected. Please install MetaMask extension or disable other wallet extensions temporarily.')
      return
    }

    setIsConnecting(true)

    try {
      console.log('Connecting to MetaMask...')
      
      // Request account access using the specific provider
      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      
      if (!Array.isArray(accounts) || accounts.length === 0) {
        alert('No accounts found. Please unlock MetaMask.')
        return
      }
      
      const account = accounts[0]
      console.log('Connected account:', account)
      setWalletAddress(`Connected: ${account}`)
      
      // Create Web3 instance with the provider
      const web3Instance = new Web3(provider)
      setWeb3(web3Instance)
      
      // Check current network and prompt to switch if needed
      await updateNetworkStatus()
      
      // Notify parent component
      onWalletConnect?.(account, web3Instance)
      
    } catch (err: any) {
      console.error('MetaMask connection error:', err)
      if (err.code === 4001) {
        alert('Connection rejected by user')
      } else if (err.code === -32002) {
        alert('MetaMask is already processing a request. Please check MetaMask and try again.')
      } else if (err.message && err.message.includes('Unexpected error')) {
        alert('Wallet conflict detected. Please disable other wallet extensions (like Phantom) and refresh the page.')
      } else {
        alert('MetaMask connection failed. Try refreshing the page or disabling other wallet extensions.')
      }
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect wallet
  const disconnect = () => {
    try {
      setWalletAddress('Disconnected')
      setWeb3(null)
      updateNetworkStatus()
      onWalletDisconnect?.()
    } catch (err) {
      console.error('Disconnect error:', err)
    }
  }

  // Format address for display
  const formatAddress = (address: string) => {
    if (address === 'Not connected' || address === 'Disconnected') return address
    if (address.startsWith('Connected: ')) {
      const addr = address.replace('Connected: ', '')
      return `Connected: ${addr.slice(0, 6)}...${addr.slice(-4)}`
    }
    return address
  }

  useEffect(() => {
    updateNetworkStatus()

    // Listen for chain and account changes
    if (window.ethereum) {
      const handleChainChanged = () => {
        console.log('Chain changed')
        updateNetworkStatus()
      }
      
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('Accounts changed')
        if (!Array.isArray(accounts) || accounts.length === 0) {
          setWalletAddress('Not connected')
          onWalletDisconnect?.()
        } else {
          const account = accounts[0]
          setWalletAddress(`Connected: ${account}`)
          if (web3) {
            onWalletConnect?.(account, web3)
          }
        }
      }

      window.ethereum.on('chainChanged', handleChainChanged)
      window.ethereum.on('accountsChanged', handleAccountsChanged)

      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged)
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [updateNetworkStatus, web3, onWalletConnect, onWalletDisconnect])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🔗 Wallet Connection</h2>
      
      <div className="space-y-4">
        {/* Connection Buttons */}
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={connectMetaMask} 
            disabled={isConnecting}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            🦊 {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </button>
          
          <button 
            onClick={disconnect} 
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            ❌ Disconnect
          </button>
        </div>
        
        {/* Wallet Info */}
        <div className="space-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <strong>Wallet:</strong> {formatAddress(walletAddress)}
          </div>
          
          <div className={`text-sm font-medium ${networkStatus.connected ? 'text-green-600' : 'text-red-600'}`}>
            {networkStatus.text}
          </div>
          
          {showSwitchButton && (
            <button 
              onClick={switchToBrainArk} 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              🔄 Switch to BrainArk Network
            </button>
          )}
        </div>

        {/* Network Info */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Network Information:</h3>
          <div className="space-y-1 text-gray-600 dark:text-gray-300">
            <div><strong>Name:</strong> {networkConfig.chainName}</div>
            <div><strong>Chain ID:</strong> {parseInt(networkConfig.chainId, 16)}</div>
            <div><strong>Currency:</strong> {networkConfig.nativeCurrency.symbol}</div>
            <div><strong>RPC:</strong> {networkConfig.rpcUrls[0]}</div>
          </div>
        </div>

              </div>
    </div>
  )
}