import React, { useState, useEffect } from 'react'
import { useAccount, useChainId, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { brainarkChain, addBrainArkNetwork, getNetworkStatus } from '@/utils/wagmiConfig'
import toast from 'react-hot-toast'

interface MobileWalletConnectorProps {
  className?: string
}

export default function MobileWalletConnector({ className = '' }: MobileWalletConnectorProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  
  const [isClient, setIsClient] = useState(false)
  const [showConnectors, setShowConnectors] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  const networkStatus = getNetworkStatus(chainId)
  const isCorrectNetwork = chainId === brainarkChain.id

  // Filter connectors to prioritize mobile-friendly ones
  const sortedConnectors = connectors.sort((a, b) => {
    // Prioritize WalletConnect and mobile wallets
    if (a.name.toLowerCase().includes('walletconnect')) return -1
    if (b.name.toLowerCase().includes('walletconnect')) return 1
    if (a.name.toLowerCase().includes('metamask')) return -1
    if (b.name.toLowerCase().includes('metamask')) return 1
    return 0
  })

  const handleConnect = async (connector: any) => {
    try {
      await connect({ connector })
      setShowConnectors(false)
      toast.success('Wallet connected successfully!')
    } catch (error: any) {
      console.error('Connection error:', error)
      toast.error(error.message || 'Failed to connect wallet')
    }
  }

  const handleDisconnect = () => {
    try {
      disconnect()
      toast.success('Wallet disconnected')
    } catch (error: any) {
      console.error('Disconnect error:', error)
      toast.error('Failed to disconnect wallet')
    }
  }

  const handleSwitchNetwork = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      // First try using wagmi's switchChain
      if (switchChain) {
        await switchChain({ chainId: brainarkChain.id })
        toast.success('Switched to BrainArk Network!')
      } else {
        // Fallback to direct MetaMask method
        const success = await addBrainArkNetwork()
        if (success) {
          toast.success('Switched to BrainArk Network!')
        } else {
          toast.error('Failed to switch network')
        }
      }
    } catch (error: any) {
      console.error('Network switch error:', error)
      toast.error(error.message || 'Failed to switch network')
    }
  }

  const formatAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getConnectorIcon = (connectorName: string) => {
    const name = connectorName.toLowerCase()
    if (name.includes('metamask')) return '🦊'
    if (name.includes('walletconnect')) return '📱'
    if (name.includes('coinbase')) return '🔵'
    if (name.includes('trust')) return '🛡️'
    if (name.includes('phantom')) return '👻'
    return '💼'
  }

  if (!isClient) {
    return (
      <div className={`bg-gray-900/50 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse flex space-x-4">
          <div className="h-12 bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 ${className}`}>
      {!isConnected ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white text-center">
            Connect Your Wallet
          </h3>
          
          {!showConnectors ? (
            <button
              onClick={() => setShowConnectors(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                         text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 
                         transform hover:scale-105 shadow-lg touch-manipulation min-h-[48px]"
            >
              🔗 Connect Wallet
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-300">Choose Wallet:</h4>
                <button
                  onClick={() => setShowConnectors(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {sortedConnectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 
                           text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 
                           border border-gray-600/50 hover:border-gray-500 disabled:opacity-50
                           touch-manipulation min-h-[48px]"
                >
                  <span className="text-xl">{getConnectorIcon(connector.name)}</span>
                  <span>{connector.name}</span>
                  {connector.name.toLowerCase().includes('walletconnect') && (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full ml-auto">
                      Mobile
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 
                           text-green-400 px-3 py-2 rounded-lg text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Wallet Connected
            </div>
          </div>

          {/* Address Display */}
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-gray-400 text-xs mb-1">Address</div>
            <div className="text-white font-mono text-sm">
              {formatAddress(address || '')}
            </div>
          </div>

          {/* Network Status & Switch */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Network:</span>
              <div className={`flex items-center gap-2 text-sm font-medium ${
                isCorrectNetwork ? 'text-green-400' : 'text-yellow-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isCorrectNetwork ? 'bg-green-400' : 'bg-yellow-400'
                }`}></div>
                {networkStatus.name}
              </div>
            </div>

            {!isCorrectNetwork && (
              <button
                onClick={handleSwitchNetwork}
                disabled={isSwitching}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 
                         text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 
                         disabled:opacity-50 touch-manipulation min-h-[48px]"
              >
                {isSwitching ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Switching...
                  </div>
                ) : (
                  '🔄 Switch to BrainArk Network'
                )}
              </button>
            )}
          </div>

          {/* Disconnect Button */}
          <button
            onClick={handleDisconnect}
            className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium py-3 px-4 
                     rounded-lg transition-all duration-200 border border-gray-600 hover:border-gray-500
                     touch-manipulation min-h-[48px]"
          >
            ❌ Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  )
}