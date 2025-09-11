import React, { useState, useEffect, useCallback, useRef } from 'react'

// Network configurations
const NETWORKS = {
  production: {
    chainId: 424242,
    chainIdHex: '0x67932',
    chainName: 'BrainArk Besu Network',
    nativeCurrency: { name: 'BrainArk', symbol: 'BAK', decimals: 18 },
    rpcUrls: ['https://rpc.brainark.online'],
    blockExplorerUrls: ['https://explorer.brainark.online']
  },
  local: {
    chainId: 424242,
    chainIdHex: '0x67932',
    chainName: 'BrainArk Local Network',
    nativeCurrency: { name: 'BrainArk', symbol: 'BAK', decimals: 18 },
    rpcUrls: ['http://localhost:8545'],
    blockExplorerUrls: ['http://localhost:3000']
  }
} as const

type NetworkType = keyof typeof NETWORKS

interface AutoWalletConnectionProps {
  onConnectionChange?: (isConnected: boolean, address?: string, isCorrectNetwork?: boolean) => void
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function AutoWalletConnectionFixed({ onConnectionChange }: AutoWalletConnectionProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string>('')
  const [currentChainId, setCurrentChainId] = useState<string>('')
  const [isDetecting, setIsDetecting] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isNetworkAction, setIsNetworkAction] = useState(false)
  const [error, setError] = useState<string>('')
  
  // Use refs to prevent infinite loops
  const providerRef = useRef<any>(null)
  const isInitializedRef = useRef(false)
  const pendingRequestRef = useRef(false)

  // Auto-detect environment
  const getNetworkType = useCallback((): NetworkType => {
    if (typeof window === 'undefined') return 'production'
    
    const hostname = window.location.hostname
    const port = window.location.port
    const isLocal = hostname === 'localhost' || 
                   hostname === '127.0.0.1' ||
                   port === '3000' || 
                   port === '3001' || 
                   port === '3002' ||
                   process.env.NODE_ENV === 'development'
    
    return isLocal ? 'local' : 'production'
  }, [])

  const networkType = getNetworkType()
  const networkConfig = NETWORKS[networkType]
  const isCorrectNetwork = currentChainId === networkConfig.chainIdHex

  // Get MetaMask provider (cached)
  const getProvider = useCallback(() => {
    if (providerRef.current) return providerRef.current
    
    if (typeof window.ethereum === 'undefined') return null
    
    let provider = window.ethereum
    
    // Handle multiple providers
    if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
      const metamaskProvider = window.ethereum.providers.find((p: any) => p.isMetaMask)
      if (metamaskProvider) {
        provider = metamaskProvider
      }
    }
    
    providerRef.current = provider
    return provider
  }, [])

  // Check if MetaMask is installed
  const isMetaMaskInstalled = useCallback(() => {
    const provider = getProvider()
    return !!(provider && (provider.isMetaMask || provider.providers?.some((p: any) => p.isMetaMask)))
  }, [getProvider])

  // Check current network
  const checkNetwork = useCallback(async () => {
    const provider = getProvider()
    if (!provider) return

    try {
      const chainId = await provider.request({ method: 'eth_chainId' })
      setCurrentChainId(chainId)
    } catch (error) {
      console.error('Error checking network:', error)
    }
  }, [getProvider])

  // Check connection status
  const checkConnection = useCallback(async () => {
    const provider = getProvider()
    if (!provider) return

    try {
      const accounts = await provider.request({ method: 'eth_accounts' })
      if (accounts && accounts.length > 0) {
        setIsConnected(true)
        setAddress(accounts[0])
        await checkNetwork()
      } else {
        setIsConnected(false)
        setAddress('')
      }
    } catch (error) {
      console.error('Error checking connection:', error)
      setIsConnected(false)
      setAddress('')
    }
  }, [getProvider, checkNetwork])

  // Initialize wallet detection
  useEffect(() => {
    if (isInitializedRef.current) return
    
    const initialize = async () => {
      setIsDetecting(true)
      setError('')
      
      try {
        if (!isMetaMaskInstalled()) {
          setError('MetaMask not detected')
          return
        }

        await checkConnection()
      } catch (error) {
        console.error('Initialization error:', error)
        setError('Failed to initialize wallet connection')
      } finally {
        setIsDetecting(false)
        isInitializedRef.current = true
      }
    }

    // Delay to ensure MetaMask is loaded
    const timer = setTimeout(initialize, 500)
    return () => clearTimeout(timer)
  }, [isMetaMaskInstalled, checkConnection])

  // Listen for account and network changes
  useEffect(() => {
    const provider = getProvider()
    if (!provider || !isInitializedRef.current) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        setIsConnected(false)
        setAddress('')
      } else {
        setIsConnected(true)
        setAddress(accounts[0])
        checkNetwork()
      }
    }

    const handleChainChanged = (chainId: string) => {
      setCurrentChainId(chainId)
    }

    provider.on('accountsChanged', handleAccountsChanged)
    provider.on('chainChanged', handleChainChanged)

    return () => {
      provider.removeListener('accountsChanged', handleAccountsChanged)
      provider.removeListener('chainChanged', handleChainChanged)
    }
  }, [getProvider, checkNetwork])

  // Notify parent of changes
  useEffect(() => {
    onConnectionChange?.(isConnected, address, isCorrectNetwork)
  }, [isConnected, address, isCorrectNetwork, onConnectionChange])

  // Test network connectivity
  const testNetworkConnectivity = useCallback(async (network: typeof networkConfig) => {
    try {
      const response = await fetch(network.rpcUrls[0], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      })
      
      if (!response.ok) return false
      
      const data = await response.json()
      return !!data.result
    } catch (error) {
      console.error('Network connectivity test failed:', error)
      return false
    }
  }, [])

  // Add/Switch network with improved error handling
  const addNetwork = useCallback(async () => {
    const provider = getProvider()
    if (!provider) {
      setError('MetaMask not detected')
      return false
    }

    if (pendingRequestRef.current) {
      setError('Request already in progress')
      return false
    }

    setIsNetworkAction(true)
    setError('')
    pendingRequestRef.current = true

    try {
      // Test network connectivity first
      const isNetworkOnline = await testNetworkConnectivity(networkConfig)
      if (!isNetworkOnline) {
        throw new Error(`Network ${networkConfig.rpcUrls[0]} is not accessible. Please ensure your blockchain is running.`)
      }

      // Try to switch first
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: networkConfig.chainIdHex }],
        })
        return true
      } catch (switchError: any) {
        // If network doesn't exist (4902), add it
        if (switchError.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: networkConfig.chainIdHex,
              chainName: networkConfig.chainName,
              nativeCurrency: networkConfig.nativeCurrency,
              rpcUrls: networkConfig.rpcUrls,
              blockExplorerUrls: networkConfig.blockExplorerUrls,
            }],
          })
          return true
        } else {
          throw switchError
        }
      }
    } catch (error: any) {
      console.error('Network operation failed:', error)
      
      if (error.code === 4001) {
        setError('User rejected the request')
      } else if (error.code === -32002) {
        setError('Request already pending in MetaMask')
      } else if (error.message?.includes('not accessible')) {
        setError(error.message)
      } else if (error.message?.includes('same RPC endpoint')) {
        setError('Network with same RPC already exists. Please remove the conflicting network from MetaMask first.')
      } else {
        setError('Failed to add network. Please try again.')
      }
      return false
    } finally {
      setIsNetworkAction(false)
      pendingRequestRef.current = false
    }
  }, [getProvider, networkConfig, testNetworkConnectivity])

  // Connect to MetaMask
  const connect = useCallback(async () => {
    const provider = getProvider()
    if (!provider) {
      setError('MetaMask not detected')
      return
    }

    if (pendingRequestRef.current) {
      setError('Request already in progress')
      return
    }

    setIsConnecting(true)
    setError('')
    pendingRequestRef.current = true

    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found')
      }

      setIsConnected(true)
      setAddress(accounts[0])
      await checkNetwork()

      // Check if we need to switch networks
      const currentChainId = await provider.request({ method: 'eth_chainId' })
      if (currentChainId.toLowerCase() !== networkConfig.chainIdHex.toLowerCase()) {
        // Don't auto-switch, just show the button
        console.log('Different network detected, user can manually switch')
      }

    } catch (error: any) {
      console.error('Connection failed:', error)
      
      if (error.code === 4001) {
        setError('Connection rejected by user')
      } else if (error.code === -32002) {
        setError('Request already pending in MetaMask')
      } else {
        setError('Failed to connect. Please try again.')
      }
    } finally {
      setIsConnecting(false)
      pendingRequestRef.current = false
    }
  }, [getProvider, checkNetwork, networkConfig.chainIdHex])

  // Disconnect
  const disconnect = useCallback(() => {
    setIsConnected(false)
    setAddress('')
    setError('')
  }, [])

  // Format address
  const formatAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Render loading state
  if (isDetecting) {
    return (
      <button className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 cursor-not-allowed">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        Detecting...
      </button>
    )
  }

  // Render error state
  if (error && !isConnected) {
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={() => window.open('https://metamask.io/download/', '_blank')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          📥 Install MetaMask
        </button>
        {error && (
          <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            {error}
          </div>
        )}
      </div>
    )
  }

  // Render not connected state
  if (!isConnected) {
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={connect}
          disabled={isConnecting}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {isConnecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Connecting...
            </>
          ) : (
            <>
              🔗 Connect Wallet
            </>
          )}
        </button>
        {error && (
          <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            {error}
          </div>
        )}
      </div>
    )
  }

  // Render wrong network state
  if (!isCorrectNetwork) {
    const currentChainIdDecimal = parseInt(currentChainId, 16)
    
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={addNetwork}
          disabled={isNetworkAction}
          className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {isNetworkAction ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Switching...
            </>
          ) : (
            <>
              ⚠️ Switch to BrainArk
            </>
          )}
        </button>
        <div className="text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
          Current: Chain {currentChainIdDecimal} | Need: Chain {networkConfig.chainId}
        </div>
        {error && (
          <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            {error}
          </div>
        )}
      </div>
    )
  }

  // Render connected state
  return (
    <div className="flex items-center gap-2">
      <div className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
        {formatAddress(address)}
      </div>
      <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
        {networkType === 'local' ? '🔧 Local' : '🌐 Prod'}
      </div>
      <button
        onClick={disconnect}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        title="Disconnect wallet"
      >
        ✕
      </button>
    </div>
  )
}