import React, { useState, useEffect } from 'react'
import { useAccount, useChainId, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { brainarkChain, addBrainArkNetwork, getNetworkStatus } from '@/utils/wagmiConfig'
import toast from 'react-hot-toast'

interface EnhancedMobileWalletConnectorProps {
  className?: string
  onNetworkChange?: (chainId: number) => void
}

// Supported networks for BAK coin purchasing
const supportedNetworks = [
  {
    chainId: 424242,
    name: 'BrainArk',
    symbol: 'BAK',
    rpcUrl: 'https://rpc.brainark.online',
    blockExplorer: 'https://brainark.online',
    icon: '🧠',
    color: 'from-purple-500 to-blue-500'
  },
  {
    chainId: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    blockExplorer: 'https://etherscan.io',
    icon: '🔷',
    color: 'from-blue-500 to-blue-600'
  },
  {
    chainId: 56,
    name: 'BSC',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    blockExplorer: 'https://bscscan.com',
    icon: '🟡',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    chainId: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    icon: '🟣',
    color: 'from-purple-500 to-purple-600'
  }
]

export default function EnhancedMobileWalletConnector({ 
  className = '', 
  onNetworkChange 
}: EnhancedMobileWalletConnectorProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  
  const [isClient, setIsClient] = useState(false)
  const [showConnectors, setShowConnectors] = useState(false)
  const [showNetworks, setShowNetworks] = useState(false)
  const [switchingTo, setSwitchingTo] = useState<number | null>(null)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  const currentNetwork = supportedNetworks.find(n => n.chainId === chainId)
  const networkStatus = getNetworkStatus(chainId)

  // Filter and sort connectors for mobile optimization
  const sortedConnectors = connectors.sort((a, b) => {
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
      toast.success(`Connected with ${connector.name}!`)
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

  const handleNetworkSwitch = async (targetChainId: number) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    const targetNetwork = supportedNetworks.find(n => n.chainId === targetChainId)
    if (!targetNetwork) return

    setSwitchingTo(targetChainId)
    
    try {
      // Create timeout promise for network switching
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Network switch timeout')), 15000)
      })

      let switchPromise: Promise<any>

      if (targetChainId === 424242) {
        // BrainArk network - use custom add network method
        switchPromise = addBrainArkNetwork().then(success => {
          if (!success) throw new Error('Failed to add BrainArk network')
        })
      } else {
        // Other networks - use wagmi switchChain
        switchPromise = switchChain({ chainId: targetChainId })
      }

      // Show loading toast
      const loadingToast = toast.loading(`⏳ Switching to ${targetNetwork.name}...`)

      // Race between switch and timeout
      await Promise.race([switchPromise, timeoutPromise])

      // Verify network switch after a brief delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const currentChainId = await window.ethereum?.request({ method: 'eth_chainId' })
      const currentChainIdNumber = currentChainId ? parseInt(currentChainId, 16) : chainId

      toast.dismiss(loadingToast)
      
      if (currentChainIdNumber === targetChainId) {
        toast.success(`✅ Switched to ${targetNetwork.name} network!`)
        onNetworkChange?.(targetChainId)
      } else {
        throw new Error('Network verification failed')
      }

    } catch (error: any) {
      console.error('Network switch error:', error)
      
      if (error.message.includes('timeout')) {
        toast.error(
          `⏰ Network switch timed out. Please manually switch to ${targetNetwork.name} in your wallet.`,
          { duration: 8000 }
        )
      } else if (error.code === 4001) {
        toast.error('Network switch cancelled by user')
      } else {
        toast.error(`Failed to switch to ${targetNetwork.name}: ${error.message}`)
      }
    } finally {
      setSwitchingTo(null)
      setShowNetworks(false)
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
    <div className={`bg-gray-900/90 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 shadow-xl ${className}`}>
      {!isConnected ? (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Connect Your Wallet
          </h3>
          <p className="text-gray-400 text-sm text-center">
            Connect to buy BAK tokens on multiple networks
          </p>
          
          {!showConnectors ? (
            <button
              onClick={() => setShowConnectors(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                         text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 
                         transform hover:scale-105 shadow-lg hover:shadow-xl touch-manipulation min-h-[56px]
                         border border-blue-400/20"
            >
              <span className="flex items-center justify-center gap-3">
                📱 Connect Wallet
              </span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-300">Choose Wallet:</h4>
                <button
                  onClick={() => setShowConnectors(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  ✕
                </button>
              </div>
              
              {sortedConnectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  disabled={isPending}
                  className="w-full flex items-center justify-between gap-3 bg-gray-800/80 hover:bg-gray-700/80 
                           text-white font-medium py-4 px-4 rounded-xl transition-all duration-200 
                           border border-gray-600/30 hover:border-gray-500/50 disabled:opacity-50
                           touch-manipulation min-h-[56px] hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getConnectorIcon(connector.name)}</span>
                    <span className="font-semibold">{connector.name}</span>
                  </div>
                  {connector.name.toLowerCase().includes('walletconnect') && (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-medium">
                      Recommended
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
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/40 
                           text-green-400 px-4 py-2 rounded-xl text-sm font-medium">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              Wallet Connected
            </div>
          </div>

          {/* Address Display */}
          <div className="bg-gray-800/60 rounded-xl p-4 text-center border border-gray-700/30">
            <div className="text-gray-400 text-xs mb-2 font-medium">Wallet Address</div>
            <div className="text-white font-mono text-lg font-semibold">
              {formatAddress(address || '')}
            </div>
          </div>

          {/* Current Network */}
          <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm font-medium">Current Network:</span>
              <div className="flex items-center gap-2">
                {currentNetwork && (
                  <>
                    <span className="text-2xl">{currentNetwork.icon}</span>
                    <span className="text-white font-semibold">{currentNetwork.name}</span>
                  </>
                )}
              </div>
            </div>

            {/* Network Switch Button */}
            {!showNetworks ? (
              <button
                onClick={() => setShowNetworks(true)}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 
                         text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 
                         touch-manipulation min-h-[48px] border border-orange-400/20 hover:shadow-lg"
              >
                🔄 Switch Network
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-300">Select Network:</h4>
                  <button
                    onClick={() => setShowNetworks(false)}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                  >
                    ✕
                  </button>
                </div>
                
                {supportedNetworks.map((network) => (
                  <button
                    key={network.chainId}
                    onClick={() => handleNetworkSwitch(network.chainId)}
                    disabled={isSwitching || switchingTo === network.chainId}
                    className={`w-full flex items-center justify-between gap-3 py-4 px-4 rounded-xl 
                               transition-all duration-200 touch-manipulation min-h-[56px] font-medium
                               ${chainId === network.chainId 
                                 ? 'bg-green-500/20 border-green-500/40 text-green-400' 
                                 : 'bg-gray-800/60 hover:bg-gray-700/60 border-gray-600/30 hover:border-gray-500/50 text-white'
                               } 
                               ${(isSwitching || switchingTo === network.chainId) ? 'opacity-50' : 'hover:shadow-md'}
                               border`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{network.icon}</span>
                      <div className="text-left">
                        <div className="font-bold">{network.name}</div>
                        <div className="text-xs opacity-70">{network.symbol}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {chainId === network.chainId && (
                        <span className="text-green-400 font-bold">✓</span>
                      )}
                      {switchingTo === network.chainId && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                  </button>
                ))}
                
                <div className="text-xs text-gray-400 text-center mt-3 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  💡 Switch networks to buy BAK tokens with different cryptocurrencies
                </div>
              </div>
            )}
          </div>

          {/* Disconnect Button */}
          <button
            onClick={handleDisconnect}
            className="w-full bg-gray-700/80 hover:bg-gray-600/80 text-gray-200 font-medium py-3 px-4 
                     rounded-xl transition-all duration-200 border border-gray-600/50 hover:border-gray-500/50
                     touch-manipulation min-h-[48px] hover:shadow-md"
          >
            ❌ Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  )
}