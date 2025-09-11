import React, { useState, useEffect, useCallback } from 'react'

// BrainArk Network Configuration - Production
const BRAINARK_NETWORK_PRODUCTION = {
  chainId: 424242,
  chainIdHex: '0x67932', // 424242 in hex
  chainName: 'BrainArk Besu Network',
  nativeCurrency: {
    name: 'BrainArk',
    symbol: 'BAK',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.brainark.online'],
  blockExplorerUrls: ['https://explorer.brainark.online'],
  type: 'production' as const
}

// BrainArk Network Configuration - Local Development
const BRAINARK_NETWORK_LOCAL = {
  chainId: 424242,
  chainIdHex: '0x67932', // 424242 in hex
  chainName: 'BrainArk Besu Network (Local)',
  nativeCurrency: {
    name: 'BrainArk',
    symbol: 'BAK',
    decimals: 18,
  },
  rpcUrls: ['http://localhost:8545'],
  blockExplorerUrls: ['http://localhost:3000'],
  type: 'local' as const
}

type NetworkType = 'production' | 'local'

interface AutoWalletConnectionProps {
  onConnectionChange?: (isConnected: boolean, address?: string, isCorrectNetwork?: boolean, networkType?: NetworkType) => void
  defaultNetworkType?: NetworkType
  showNetworkSwitch?: boolean
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function AutoWalletConnectionNetworkSwitch({ 
  onConnectionChange, 
  defaultNetworkType = 'production',
  showNetworkSwitch = true 
}: AutoWalletConnectionProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string>('')
  const [currentChainId, setCurrentChainId] = useState<string>('')
  const [isDetecting, setIsDetecting] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isAddingNetwork, setIsAddingNetwork] = useState(false)
  const [showNetworkPrompt, setShowNetworkPrompt] = useState(false)
  const [metaMaskInstalled, setMetaMaskInstalled] = useState(false)
  const [selectedNetworkType, setSelectedNetworkType] = useState<NetworkType>(defaultNetworkType)
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false)

  // Get current network config based on selected type
  const getCurrentNetworkConfig = useCallback(() => {
    return selectedNetworkType === 'local' ? BRAINARK_NETWORK_LOCAL : BRAINARK_NETWORK_PRODUCTION
  }, [selectedNetworkType])

  const networkConfig = getCurrentNetworkConfig()
  const isCorrectNetwork = currentChainId === networkConfig.chainIdHex

  // Auto-detect environment and set default network type
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const port = window.location.port
      const isLocal = hostname === 'localhost' || 
                     hostname === '127.0.0.1' || 
                     hostname === '0.0.0.0' ||
                     port === '3000' || 
                     port === '3001' || 
                     port === '3002' ||
                     process.env.NODE_ENV === 'development'
      
      if (isLocal && defaultNetworkType === 'production') {
        setSelectedNetworkType('local')
      }
    }
  }, [defaultNetworkType])

  // Enhanced MetaMask detection
  const checkMetaMaskInstallation = useCallback(() => {
    if (typeof window === 'undefined') return false
    
    console.log('Checking MetaMask installation...')
    console.log('window.ethereum exists:', !!window.ethereum)
    
    if (!window.ethereum) {
      console.log('No ethereum object found')
      return false
    }
    
    if (window.ethereum.isMetaMask) {
      console.log('MetaMask detected directly')
      return true
    }
    
    if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
      const hasMetaMask = window.ethereum.providers.some((provider: any) => provider.isMetaMask)
      console.log('MetaMask in providers array:', hasMetaMask)
      return hasMetaMask
    }
    
    console.log('Ethereum object exists, assuming MetaMask-compatible wallet')
    return true
  }, [])

  // Get the correct MetaMask provider when multiple wallets are installed
  const getMetaMaskProvider = useCallback(() => {
    if (typeof window.ethereum === 'undefined') {
      console.log('No ethereum object available')
      return null
    }

    if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
      console.log('Multiple providers detected:', window.ethereum.providers.length)
      const metamaskProvider = window.ethereum.providers.find((provider: any) => provider.isMetaMask)
      if (metamaskProvider) {
        console.log('Found MetaMask provider')
        return metamaskProvider
      }
    }

    if (window.ethereum.isMetaMask) {
      console.log('Direct MetaMask provider')
      return window.ethereum
    }

    console.log('Using fallback ethereum provider')
    return window.ethereum
  }, [])

  // Check current network
  const checkNetwork = useCallback(async () => {
    const provider = getMetaMaskProvider()
    if (!provider) return

    try {
      const chainId = await provider.request({ method: 'eth_chainId' })
      setCurrentChainId(chainId)
      console.log('Current chain ID:', chainId, 'Expected:', networkConfig.chainIdHex)
      
      if (chainId.toLowerCase() === networkConfig.chainIdHex.toLowerCase()) {
        setShowNetworkPrompt(false)
      } else if (isConnected) {
        setShowNetworkPrompt(true)
      }
    } catch (error) {
      console.error('Error checking network:', error)
    }
  }, [getMetaMaskProvider, networkConfig.chainIdHex, isConnected])

  // Check if wallet is already connected
  const checkConnection = useCallback(async () => {
    const provider = getMetaMaskProvider()
    if (!provider) return

    try {
      const accounts = await provider.request({ method: 'eth_accounts' })
      if (accounts && accounts.length > 0) {
        setIsConnected(true)
        setAddress(accounts[0])
        await checkNetwork()
      }
    } catch (error) {
      console.error('Error checking connection:', error)
    }
  }, [getMetaMaskProvider, checkNetwork])

  // Auto-detect wallet and network on component mount
  useEffect(() => {
    const detectWalletAndNetwork = async () => {
      setIsDetecting(true)
      
      try {
        const isInstalled = checkMetaMaskInstallation()
        setMetaMaskInstalled(isInstalled)
        
        if (!isInstalled) {
          console.log('MetaMask not installed')
          setIsDetecting(false)
          return
        }

        await checkConnection()
        await checkNetwork()
      } catch (error) {
        console.error('Wallet detection error:', error)
      } finally {
        setIsDetecting(false)
      }
    }

    const timer = setTimeout(detectWalletAndNetwork, 100)
    return () => clearTimeout(timer)
  }, [checkMetaMaskInstallation, checkConnection, checkNetwork])

  // Notify parent of connection changes
  useEffect(() => {
    onConnectionChange?.(isConnected, address, isCorrectNetwork, selectedNetworkType)
  }, [isConnected, address, isCorrectNetwork, selectedNetworkType, onConnectionChange])

  // Listen for account and network changes
  useEffect(() => {
    const provider = getMetaMaskProvider()
    if (!provider) return

    const handleAccountsChanged = (accounts: string[]) => {
      console.log('Accounts changed:', accounts)
      if (!accounts || accounts.length === 0) {
        setIsConnected(false)
        setAddress('')
        setShowNetworkPrompt(false)
      } else {
        setIsConnected(true)
        setAddress(accounts[0])
        checkNetwork()
      }
    }

    const handleChainChanged = (chainId: string) => {
      console.log('Chain changed to:', chainId)
      setCurrentChainId(chainId)
      if (chainId.toLowerCase() === networkConfig.chainIdHex.toLowerCase()) {
        setShowNetworkPrompt(false)
      } else if (isConnected) {
        setShowNetworkPrompt(true)
      }
    }

    provider.on('accountsChanged', handleAccountsChanged)
    provider.on('chainChanged', handleChainChanged)

    return () => {
      provider.removeListener('accountsChanged', handleAccountsChanged)
      provider.removeListener('chainChanged', handleChainChanged)
    }
  }, [getMetaMaskProvider, networkConfig.chainIdHex, isConnected, checkNetwork])

  // Add/Switch to BrainArk network
  const addBrainArkNetwork = async (targetNetworkType: NetworkType = selectedNetworkType) => {
    const provider = getMetaMaskProvider()
    if (!provider) {
      alert('MetaMask not detected')
      return false
    }

    setIsAddingNetwork(true)

    const targetNetwork = targetNetworkType === 'local' ? BRAINARK_NETWORK_LOCAL : BRAINARK_NETWORK_PRODUCTION

    try {
      // First try to switch to the network
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetNetwork.chainIdHex }],
      })
      
      console.log(`Switched to ${targetNetwork.chainName}`)
      setShowNetworkPrompt(false)
      return true
    } catch (switchError: any) {
      // If network doesn't exist (error 4902), add it
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: targetNetwork.chainIdHex,
              chainName: targetNetwork.chainName,
              nativeCurrency: targetNetwork.nativeCurrency,
              rpcUrls: targetNetwork.rpcUrls,
              blockExplorerUrls: targetNetwork.blockExplorerUrls,
            }],
          })
          
          console.log(`Added and switched to ${targetNetwork.chainName}`)
          setShowNetworkPrompt(false)
          return true
        } catch (addError: any) {
          console.error('Failed to add network:', addError)
          if (addError.code === 4001) {
            alert('Network addition rejected by user')
          } else if (addError.code === -32002) {
            alert('Request already pending. Please check MetaMask.')
          } else {
            alert('Failed to add network. Please add manually.')
          }
          return false
        }
      } else if (switchError.code === 4001) {
        console.log('Network switch rejected by user')
        return false
      } else if (switchError.code === -32002) {
        alert('Request already pending. Please check MetaMask.')
        return false
      } else {
        console.error('Network switch error:', switchError)
        alert('Failed to switch network')
        return false
      }
    } finally {
      setIsAddingNetwork(false)
    }
  }

  // Switch network type and update MetaMask
  const switchNetworkType = async (newType: NetworkType) => {
    if (newType === selectedNetworkType) return

    setIsSwitchingNetwork(true)
    setSelectedNetworkType(newType)

    if (isConnected) {
      // If connected, try to switch MetaMask to the new network
      await addBrainArkNetwork(newType)
    }

    setIsSwitchingNetwork(false)
  }

  // Connect to MetaMask
  const connectMetaMask = async () => {
    const provider = getMetaMaskProvider()
    
    if (!provider) {
      alert('MetaMask not detected. Please install MetaMask extension.')
      window.open('https://metamask.io/download/', '_blank')
      return
    }

    setIsConnecting(true)

    try {
      console.log('Connecting to MetaMask...')
      
      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      
      if (!Array.isArray(accounts) || accounts.length === 0) {
        alert('No accounts found. Please unlock MetaMask.')
        return
      }
      
      const account = accounts[0]
      console.log('Connected account:', account)
      setIsConnected(true)
      setAddress(account)
      
      await checkNetwork()
      
      // If not on correct network, automatically try to add/switch
      const currentChainId = await provider.request({ method: 'eth_chainId' })
      if (currentChainId.toLowerCase() !== networkConfig.chainIdHex.toLowerCase()) {
        console.log('Wrong network detected, prompting to add BrainArk network...')
        await addBrainArkNetwork(selectedNetworkType)
      }
      
    } catch (err: any) {
      console.error('MetaMask connection error:', err)
      if (err.code === 4001) {
        alert('Connection rejected by user')
      } else if (err.code === -32002) {
        alert('MetaMask is already processing a request. Please check MetaMask and try again.')
      } else {
        alert('MetaMask connection failed. Try refreshing the page.')
      }
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect wallet
  const disconnect = () => {
    setIsConnected(false)
    setAddress('')
    setShowNetworkPrompt(false)
    console.log('Wallet disconnected')
  }

  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Test network connectivity
  const testNetworkConnectivity = async (networkType: NetworkType) => {
    const testNetwork = networkType === 'local' ? BRAINARK_NETWORK_LOCAL : BRAINARK_NETWORK_PRODUCTION
    const rpcUrl = testNetwork.rpcUrls[0]
    
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      })
      
      const data = await response.json()
      return !!data.result
    } catch (error) {
      console.error(`Network connectivity test failed for ${networkType}:`, error)
      return false
    }
  }

  if (isDetecting) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="text-gray-600 dark:text-gray-300">Detecting wallet...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">🔗 Wallet Connection</h2>
        
        {/* Network Type Switch */}
        {showNetworkSwitch && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Network:</span>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => switchNetworkType('production')}
                disabled={isSwitchingNetwork}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  selectedNetworkType === 'production'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                }`}
              >
                🌐 Production
              </button>
              <button
                onClick={() => switchNetworkType('local')}
                disabled={isSwitchingNetwork}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  selectedNetworkType === 'local'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                }`}
              >
                🔧 Local
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Current Network Info */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {networkConfig.chainName}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              RPC: {networkConfig.rpcUrls[0]}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-600 dark:text-gray-400">Chain ID</div>
            <div className="text-sm font-mono text-gray-900 dark:text-white">
              {networkConfig.chainId}
            </div>
          </div>
        </div>
      </div>

      {!metaMaskInstalled ? (
        // MetaMask not detected
        <div className="text-center space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              ⚠️ MetaMask Not Detected
            </h3>
            <p className="text-red-700 dark:text-red-300 mb-4">
              MetaMask extension is required to connect to the BrainArk network.
            </p>
            <button
              onClick={() => window.open('https://metamask.io/download/', '_blank')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              📥 Install MetaMask
            </button>
          </div>
        </div>
      ) : !isConnected ? (
        // Not connected
        <div className="text-center space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
              🔗 Connect Your Wallet
            </h3>
            <p className="text-blue-700 dark:text-blue-300 mb-4">
              Connect your MetaMask wallet to access the BrainArk network.
              <br/>
              <small>We'll automatically add the {networkConfig.chainName} for you!</small>
            </p>
            <button
              onClick={connectMetaMask}
              disabled={isConnecting}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Connecting...
                </>
              ) : (
                <>
                  🦊 Connect MetaMask
                </>
              )}
            </button>
          </div>
        </div>
      ) : !isCorrectNetwork || showNetworkPrompt ? (
        // Connected but wrong network
        <div className="text-center space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ Wrong Network Detected
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 mb-2">
              Current: <strong>Chain ID {parseInt(currentChainId, 16)}</strong>
            </p>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              Required: <strong>{networkConfig.chainName} (Chain ID: {networkConfig.chainId})</strong>
            </p>
            <button
              onClick={() => addBrainArkNetwork(selectedNetworkType)}
              disabled={isAddingNetwork}
              className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
            >
              {isAddingNetwork ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding Network...
                </>
              ) : (
                <>
                  🌐 Switch to {networkConfig.chainName}
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        // Connected and correct network
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                  ✅ Wallet Connected
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Address: <span className="font-mono">{formatAddress(address)}</span>
                </p>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Network: {networkConfig.chainName}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {showNetworkSwitch && selectedNetworkType !== 'production' && (
                  <button
                    onClick={() => switchNetworkType('production')}
                    disabled={isSwitchingNetwork}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {isSwitchingNetwork ? '...' : '🌐 Prod'}
                  </button>
                )}
                {showNetworkSwitch && selectedNetworkType !== 'local' && (
                  <button
                    onClick={() => switchNetworkType('local')}
                    disabled={isSwitchingNetwork}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {isSwitchingNetwork ? '...' : '🔧 Local'}
                  </button>
                )}
                <button
                  onClick={disconnect}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Network Details */}
      <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          {selectedNetworkType === 'local' ? '🔧 Local Development' : '🌐 Production'} Network Details:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2 text-gray-600 dark:text-gray-300">
            <div><strong>Chain ID:</strong> {networkConfig.chainId}</div>
            <div><strong>Currency:</strong> {networkConfig.nativeCurrency.symbol}</div>
            <div><strong>Type:</strong> {selectedNetworkType === 'local' ? 'Local Development' : 'Production'}</div>
          </div>
          <div className="space-y-2 text-gray-600 dark:text-gray-300">
            <div>
              <strong>RPC URL:</strong>{' '}
              <a 
                href={networkConfig.rpcUrls[0]} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 underline text-xs break-all"
              >
                {networkConfig.rpcUrls[0]}
              </a>
            </div>
            <div>
              <strong>Explorer:</strong>{' '}
              <a 
                href={networkConfig.blockExplorerUrls[0]} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 underline text-xs break-all"
              >
                {networkConfig.blockExplorerUrls[0]}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}