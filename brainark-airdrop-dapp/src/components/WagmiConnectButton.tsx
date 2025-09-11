import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { brainarkChain } from '@/utils/enhancedWagmiConfig'

interface WagmiConnectButtonProps {
  className?: string
  onConnectionChange?: (isConnected: boolean, address?: string, isCorrectNetwork?: boolean) => void
  preferredNetwork?: number
  showNetworkSwitcher?: boolean
}

export default function WagmiConnectButton({ 
  className = '',
  onConnectionChange,
  preferredNetwork = brainarkChain.id,
  showNetworkSwitcher = true
}: WagmiConnectButtonProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { connect, connectors, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const [isClient, setIsClient] = useState(false)
  const [showConnectors, setShowConnectors] = useState(false)

  const isCorrectNetwork = chainId === preferredNetwork

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Notify parent component of connection changes
  useEffect(() => {
    if (onConnectionChange && isClient) {
      onConnectionChange(isConnected, address, isCorrectNetwork)
    }
  }, [isConnected, address, isCorrectNetwork, onConnectionChange, isClient])

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to connect wallet')
    }
  }, [error])

  const handleConnect = async (connector: any) => {
    try {
      console.log('Attempting to connect with:', connector.name, connector)
      
      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout after 30 seconds')), 30000)
      })
      
      const connectPromise = connect({ connector })
      
      await Promise.race([connectPromise, timeoutPromise])
      
      setShowConnectors(false)
      toast.success(`Connected with ${connector.name}!`)
    } catch (err: any) {
      console.error('Connection error:', err)
      
      // Handle specific error cases
      if (err.message?.includes('timeout')) {
        toast.error('Connection timeout. Please try again.')
      } else if (err.message?.includes('rejected')) {
        toast.error('Connection rejected by user')
      } else if (err.message?.includes('unavailable') || err.message?.includes('not available')) {
        toast.error(`${connector.name} is not available. Please install it first.`)
      } else {
        toast.error(err.message || `Failed to connect with ${connector.name}`)
      }
    }
  }

  const handleDisconnect = () => {
    disconnect()
    toast.success('Wallet disconnected')
  }

  const handleSwitchNetwork = async () => {
    if (!isConnected || !switchChain) return

    try {
      await switchChain({ chainId: preferredNetwork })
      toast.success('Network switched successfully!')
    } catch (error: any) {
      console.error('Network switch error:', error)
      if (error.message?.includes('rejected')) {
        toast.error('Network switch rejected by user')
      } else {
        toast.error(error.message || 'Failed to switch network')
      }
    }
  }

  if (!isClient) {
    return (
      <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-700 text-gray-400">
        Loading...
      </div>
    )
  }

  if (isConnected && address) {
    return (
      <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
        <div className="relative">
          <button
            onClick={() => setShowConnectors(!showConnectors)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
          >
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
            <span className="hidden sm:inline">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <span className="sm:hidden">Connected</span>
          </button>

          {showConnectors && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
              <div className="p-3">
                <div className="text-sm text-gray-300 mb-2">Connected Account</div>
                <div className="text-xs font-mono text-gray-400 mb-3 break-all">
                  {address}
                </div>
                <div className="text-xs text-gray-400 mb-3">
                  Chain: {chainId || 'Unknown'}
                </div>
                <button
                  onClick={handleDisconnect}
                  className="w-full px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </div>

        {showNetworkSwitcher && !isCorrectNetwork && (
          <button
            onClick={handleSwitchNetwork}
            disabled={isSwitching}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium transition-colors disabled:opacity-50"
          >
            {isSwitching ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Switching...</span>
              </>
            ) : (
              <>
                <span>⚠️</span>
                <span className="hidden sm:inline">Switch to {brainarkChain.name}</span>
                <span className="sm:hidden">Switch Network</span>
              </>
            )}
          </button>
        )}

        {isCorrectNetwork && (
          <div className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm">
            <span>✓</span>
            <span className="hidden sm:inline">{brainarkChain.name}</span>
            <span className="sm:hidden">Correct Network</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowConnectors(!showConnectors)}
        disabled={isPending}
        className={isPending 
          ? "inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors bg-gray-600 text-gray-400 cursor-not-allowed"
          : "inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
        }
      >
        {isPending ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Connect Wallet</span>
          </>
        )}
      </button>

      {showConnectors && !isConnected && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="text-sm font-medium text-white mb-3">Choose Wallet</div>
            <div className="space-y-2">
              {connectors.map((connector) => {
                // Custom availability check
                const getConnectorAvailability = () => {
                  if (typeof window === 'undefined') return false
                  
                  const name = connector.name.toLowerCase()
                  
                  // For MetaMask, check if window.ethereum exists and has isMetaMask
                  if (name.includes('metamask')) {
                    return !!(window.ethereum && window.ethereum.isMetaMask)
                  }
                  
                  // For WalletConnect, always show as available (it works via QR/mobile)
                  if (name.includes('walletconnect')) {
                    return true
                  }
                  
                  // For Coinbase, assume available (it can install itself)
                  if (name.includes('coinbase')) {
                    return true
                  }
                  
                  // For other connectors, use the ready property
                  return connector.ready !== false
                }
                
                const isAvailable = getConnectorAvailability()
                
                return (
                  <button
                    key={connector.uid}
                    onClick={() => isAvailable ? handleConnect(connector) : null}
                    disabled={!isAvailable || isPending}
                    className={!isAvailable || isPending
                      ? "w-full flex items-center space-x-3 p-3 rounded-lg transition-colors bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "w-full flex items-center space-x-3 p-3 rounded-lg transition-colors bg-gray-700 hover:bg-gray-600 text-white"
                    }
                  >
                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                      {connector.name === 'MetaMask' && '🦊'}
                      {connector.name === 'WalletConnect' && '🔗'}
                      {connector.name === 'Coinbase Wallet' && '💙'}
                      {!['MetaMask', 'WalletConnect', 'Coinbase Wallet'].includes(connector.name) && '👛'}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{connector.name}</div>
                      {!isAvailable && (
                        <div className="text-xs text-gray-400">Not available</div>
                      )}
                      {isAvailable && (
                        <div className="text-xs text-green-400">Available</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-700">
              <div className="text-xs text-gray-400">
                Don't have a wallet?{' '}
                <a
                  href="https://metamask.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Get MetaMask
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}