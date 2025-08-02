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
  blockExplorerUrls: ['http://localhost:3001'],
}

// Determine which network to use based on environment
const getNetworkConfig = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const port = window.location.port
    // Check for local development environment
    const isLocal = hostname === 'localhost' || 
                   hostname === '127.0.0.1' || 
                   hostname === '0.0.0.0' ||
                   port === '3000' || 
                   port === '3001' || 
                   port === '3002' ||
                   process.env.NODE_ENV === 'development'
    return isLocal ? BRAINARK_NETWORK_LOCAL : BRAINARK_NETWORK_PRODUCTION
  }
  return BRAINARK_NETWORK_PRODUCTION
}

interface AutoWalletConnectionProps {
  onConnectionChange?: (isConnected: boolean, address?: string, isCorrectNetwork?: boolean) => void
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function AutoWalletConnectionDebug({ onConnectionChange }: AutoWalletConnectionProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string>('')
  const [currentChainId, setCurrentChainId] = useState<string>('')
  const [isDetecting, setIsDetecting] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isAddingNetwork, setIsAddingNetwork] = useState(false)
  const [showNetworkPrompt, setShowNetworkPrompt] = useState(false)
  const [metaMaskInstalled, setMetaMaskInstalled] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>({})

  const networkConfig = getNetworkConfig()
  const isCorrectNetwork = currentChainId === networkConfig.chainIdHex

  // Enhanced MetaMask detection with more debugging
  const checkMetaMaskInstallation = useCallback(() => {
    if (typeof window === 'undefined') {
      setDebugInfo(prev => ({ ...prev, windowUndefined: true }))
      return false
    }
    
    const debug = {
      windowEthereum: !!window.ethereum,
      isMetaMask: window.ethereum?.isMetaMask,
      providers: window.ethereum?.providers,
      providersLength: window.ethereum?.providers?.length,
      userAgent: navigator.userAgent.includes('MetaMask'),
      timestamp: new Date().toISOString()
    }
    
    setDebugInfo(debug)
    
    console.log('MetaMask Detection Debug:', debug)
    
    // Check if ethereum object exists
    if (!window.ethereum) {
      console.log('No ethereum object found')
      return false
    }
    
    // Check for MetaMask specifically
    if (window.ethereum.isMetaMask) {
      console.log('MetaMask detected directly')
      return true
    }
    
    // Check in providers array (for multiple wallet scenario)
    if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
      const hasMetaMask = window.ethereum.providers.some((provider: any) => provider.isMetaMask)
      console.log('MetaMask in providers array:', hasMetaMask)
      return hasMetaMask
    }
    
    // Fallback check - if ethereum exists but no specific MetaMask flag
    console.log('Ethereum object exists, assuming MetaMask-compatible wallet')
    return true
  }, [])

  // Get the correct MetaMask provider when multiple wallets are installed
  const getMetaMaskProvider = useCallback(() => {
    if (typeof window.ethereum === 'undefined') {
      console.log('No ethereum object available')
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
        // Wait a bit longer for MetaMask to load
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Check MetaMask installation
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

    // Add a longer delay to ensure window.ethereum is loaded
    const timer = setTimeout(detectWalletAndNetwork, 1000)
    return () => clearTimeout(timer)
  }, [checkMetaMaskInstallation, checkConnection, checkNetwork])

  // Notify parent of connection changes
  useEffect(() => {
    onConnectionChange?.(isConnected, address, isCorrectNetwork)
  }, [isConnected, address, isCorrectNetwork, onConnectionChange])

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

  // Add BrainArk network to MetaMask
  const addBrainArkNetwork = async (useLocal = false) => {
    const provider = getMetaMaskProvider()
    if (!provider) {
      alert('MetaMask not detected')
      return false
    }

    setIsAddingNetwork(true)

    const targetNetwork = useLocal ? BRAINARK_NETWORK_LOCAL : BRAINARK_NETWORK_PRODUCTION

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
          } else {
            alert('Failed to add network. Please add manually.')
          }
          return false
        }
      } else if (switchError.code === 4001) {
        console.log('Network switch rejected by user')
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

  // Connect to MetaMask with automatic network addition
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
      
      // Request account access
      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      
      if (!Array.isArray(accounts) || accounts.length === 0) {
        alert('No accounts found. Please unlock MetaMask.')
        return
      }
      
      const account = accounts[0]
      console.log('Connected account:', account)
      setIsConnected(true)
      setAddress(account)
      
      // Check current network
      await checkNetwork()
      
      // If not on correct network, automatically prompt to add/switch
      const currentChainId = await provider.request({ method: 'eth_chainId' })
      if (currentChainId.toLowerCase() !== networkConfig.chainIdHex.toLowerCase()) {
        console.log('Wrong network detected, prompting to add BrainArk network...')
        // Automatically try to add the network
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        await addBrainArkNetwork(isLocal)
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

  // Check if we're in local development
  const isLocalDev = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

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
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🔗 Wallet Connection (Debug)</h2>
      
      {/* Debug Information */}
      <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs">
        <div><strong>Debug Info:</strong></div>
        <div>MetaMask Installed: {metaMaskInstalled ? '✅' : '❌'}</div>
        <div>window.ethereum exists: {typeof window !== 'undefined' && !!window.ethereum ? '✅' : '❌'}</div>
        <div>window.ethereum.isMetaMask: {typeof window !== 'undefined' && window.ethereum?.isMetaMask ? '✅' : '❌'}</div>
        <div>Providers array: {typeof window !== 'undefined' && window.ethereum?.providers ? `${window.ethereum.providers.length} providers` : 'None'}</div>
        <div>Is Connected: {isConnected ? '✅' : '❌'}</div>
        <div>Current Chain ID: {currentChainId || 'None'}</div>
        <div>User Agent includes MetaMask: {typeof window !== 'undefined' && navigator.userAgent.includes('MetaMask') ? '✅' : '❌'}</div>
        <div>Debug timestamp: {debugInfo.timestamp}</div>
      </div>

      {!metaMaskInstalled ? (
        // MetaMask not detected
        <div className="text-center space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              ⚠️ MetaMask Not Detected
            </h3>
            <p className="text-red-700 dark:text-red-300 mb-4">
              MetaMask extension is not detected in your browser. Please install MetaMask to continue.
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
              Connect your MetaMask wallet to access the BrainArk airdrop and EPO.
              <br/>
              <small>We'll automatically detect and add the BrainArk network for you!</small>
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
              You're connected to: <strong>Chain ID {parseInt(currentChainId, 16)}</strong>
            </p>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              Please switch to the BrainArk Besu Network (Chain ID: 424242) to continue.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => addBrainArkNetwork(false)}
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
                    🌐 Add BrainArk Network
                  </>
                )}
              </button>
              
              {isLocalDev && (
                <button
                  onClick={() => addBrainArkNetwork(true)}
                  disabled={isAddingNetwork}
                  className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                >
                  🔧 Add BrainArk Network (Local Dev)
                </button>
              )}
              
              <div className="text-sm text-yellow-600 dark:text-yellow-400">
                This will automatically add the BrainArk network to your MetaMask
              </div>
            </div>
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
                  Network: {networkConfig.chainName} (ID: {networkConfig.chainId})
                </p>
              </div>
              <button
                onClick={disconnect}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Network Information */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">BrainArk Network Information:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2 text-gray-600 dark:text-gray-300">
            <div><strong>Chain ID:</strong> 424242</div>
            <div><strong>Currency:</strong> BAK</div>
            <div><strong>Consensus:</strong> IBFT 2.0</div>
          </div>
          <div className="space-y-2 text-gray-600 dark:text-gray-300">
            <div>
              <strong>Production RPC:</strong>{' '}
              <a 
                href="https://rpc.brainark.online" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 underline text-xs"
              >
                https://rpc.brainark.online
              </a>
            </div>
            <div>
              <strong>Explorer:</strong>{' '}
              <a 
                href="https://explorer.brainark.online" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 underline text-xs"
              >
                https://explorer.brainark.online
              </a>
            </div>
            {isLocalDev && (
              <div><strong>Local RPC:</strong> http://localhost:8545</div>
            )}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-4 text-center">
        <details className="text-sm text-gray-600 dark:text-gray-400">
          <summary className="cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">
            Need help connecting?
          </summary>
          <div className="mt-2 space-y-2 text-left">
            <p>1. Make sure MetaMask is installed and unlocked</p>
            <p>2. Click "Connect MetaMask" to connect your wallet</p>
            <p>3. We'll automatically detect your network and prompt you to add BrainArk</p>
            <p>4. Approve the connection and network addition in MetaMask</p>
            <p>5. You'll be connected to Chain ID 424242 (BrainArk Besu Network)</p>
          </div>
        </details>
      </div>
    </div>
  )
}