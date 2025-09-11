import React, { useState, useEffect, useCallback } from 'react'

// Network configurations
const NETWORKS = {
  production: {
    chainId: 424242,
    chainIdHex: '0x67932',
    chainName: 'BrainArk Besu Network',
    nativeCurrency: { name: 'BrainArk', symbol: 'BAK', decimals: 18 },
    rpcUrls: ['https://rpc.brainark.online'],
    blockExplorerUrls: ['https://explorer.brainark.online'],
    icon: '🌐'
  },
  local: {
    chainId: 424242,
    chainIdHex: '0x67932',
    chainName: 'BrainArk Besu Network (Local)',
    nativeCurrency: { name: 'BrainArk', symbol: 'BAK', decimals: 18 },
    rpcUrls: ['http://localhost:8545'],
    blockExplorerUrls: ['http://localhost:3000'],
    icon: '🔧'
  }
} as const

type NetworkType = keyof typeof NETWORKS

interface CompactWalletConnectionProps {
  onConnectionChange?: (isConnected: boolean, address?: string, networkType?: NetworkType) => void
  defaultNetwork?: NetworkType
  showNetworkSwitch?: boolean
  className?: string
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function CompactWalletConnection({ 
  onConnectionChange, 
  defaultNetwork = 'production',
  showNetworkSwitch = true,
  className = ''
}: CompactWalletConnectionProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string>('')
  const [currentChainId, setCurrentChainId] = useState<string>('')
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>(defaultNetwork)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isNetworkAction, setIsNetworkAction] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const networkConfig = NETWORKS[selectedNetwork]
  const isCorrectNetwork = currentChainId === networkConfig.chainIdHex

  // Auto-detect environment
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     process.env.NODE_ENV === 'development'
      if (isLocal && defaultNetwork === 'production') {
        setSelectedNetwork('local')
      }
    }
  }, [defaultNetwork])

  const getProvider = useCallback(() => {
    if (typeof window.ethereum === 'undefined') return null
    
    if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
      return window.ethereum.providers.find((provider: any) => provider.isMetaMask) || window.ethereum
    }
    
    return window.ethereum
  }, [])

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

  const checkConnection = useCallback(async () => {
    const provider = getProvider()
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
  }, [getProvider, checkNetwork])

  useEffect(() => {
    const timer = setTimeout(() => {
      checkConnection()
    }, 100)
    return () => clearTimeout(timer)
  }, [checkConnection])

  useEffect(() => {
    onConnectionChange?.(isConnected, address, selectedNetwork)
  }, [isConnected, address, selectedNetwork, onConnectionChange])

  useEffect(() => {
    const provider = getProvider()
    if (!provider) return

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

  const switchNetwork = async (networkType: NetworkType) => {
    const provider = getProvider()
    if (!provider) return

    setIsNetworkAction(true)
    const targetNetwork = NETWORKS[networkType]

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetNetwork.chainIdHex }],
      })
      setSelectedNetwork(networkType)
    } catch (switchError: any) {
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
          setSelectedNetwork(networkType)
        } catch (addError: any) {
          console.error('Failed to add network:', addError)
        }
      }
    } finally {
      setIsNetworkAction(false)
      setShowDropdown(false)
    }
  }

  const connect = async () => {
    const provider = getProvider()
    if (!provider) {
      window.open('https://metamask.io/download/', '_blank')
      return
    }

    setIsConnecting(true)
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      if (accounts && accounts.length > 0) {
        setIsConnected(true)
        setAddress(accounts[0])
        await checkNetwork()
        
        // Auto-switch to selected network if needed
        const currentChainId = await provider.request({ method: 'eth_chainId' })
        if (currentChainId.toLowerCase() !== networkConfig.chainIdHex.toLowerCase()) {
          await switchNetwork(selectedNetwork)
        }
      }
    } catch (error: any) {
      console.error('Connection error:', error)
      if (error.code === -32002) {
        alert('Please check MetaMask - there may be a pending request.')
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setAddress('')
    setShowDropdown(false)
  }

  const formatAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Check if MetaMask is installed
  const hasMetaMask = typeof window !== 'undefined' && !!window.ethereum

  if (!hasMetaMask) {
    return (
      <button
        onClick={() => window.open('https://metamask.io/download/', '_blank')}
        className={`bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${className}`}
      >
        📥 Install MetaMask
      </button>
    )
  }

  if (!isConnected) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showNetworkSwitch && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            >
              {networkConfig.icon}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-[160px]">
                {Object.entries(NETWORKS).map(([key, network]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedNetwork(key as NetworkType)
                      setShowDropdown(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
                      selectedNetwork === key ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {network.icon} {key === 'production' ? 'Production' : 'Local'}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
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
              🔗 Connect
            </>
          )}
        </button>
      </div>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={() => switchNetwork(selectedNetwork)}
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
              ⚠️ Wrong Network
            </>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showNetworkSwitch && (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
          >
            {networkConfig.icon}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-[160px]">
              {Object.entries(NETWORKS).map(([key, network]) => (
                <button
                  key={key}
                  onClick={() => switchNetwork(key as NetworkType)}
                  disabled={isNetworkAction}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 ${
                    selectedNetwork === key ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {network.icon} {key === 'production' ? 'Production' : 'Local'}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
        {formatAddress(address)}
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