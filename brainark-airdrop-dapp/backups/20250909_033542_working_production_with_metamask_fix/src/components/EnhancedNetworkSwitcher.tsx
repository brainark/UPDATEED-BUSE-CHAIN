
import React, { useState, useEffect } from 'react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { toast } from 'react-hot-toast'
import { switchToNetwork, getEnhancedNetworkStatus, getTreasuryAddressForNetwork } from '@/utils/enhancedWagmiConfig'

interface NetworkConfig {
  chainId: number
  name: string
  symbol: string
  icon: string
  color: string
  rpcUrl: string
  blockExplorer: string
  isSupported: boolean
}

interface EnhancedNetworkSwitcherProps {
  onNetworkChange?: (chainId: number) => void
  selectedToken?: string
  className?: string
}

const SUPPORTED_NETWORKS: NetworkConfig[] = [
  {
    chainId: 424242,
    name: 'BrainArk',
    symbol: 'BAK',
    icon: '🧠',
    color: 'from-purple-500 to-blue-500',
    rpcUrl: 'https://rpc.brainark.online',
    blockExplorer: 'https://explorer.brainark.online',
    isSupported: true,
  },
  {
    chainId: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '💎',
    color: 'from-blue-500 to-blue-600',
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io',
    isSupported: true,
  },
  {
    chainId: 56,
    name: 'BSC',
    symbol: 'BNB',
    icon: '🟡',
    color: 'from-yellow-500 to-orange-500',
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    blockExplorer: 'https://bscscan.com',
    isSupported: true,
  },
  {
    chainId: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    icon: '🟣',
    color: 'from-purple-500 to-purple-600',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    isSupported: true,
  },
]

export default function EnhancedNetworkSwitcher({ 
  onNetworkChange, 
  selectedToken = 'USDT',
  className = '' 
}: EnhancedNetworkSwitcherProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  
  const [isClient, setIsClient] = useState(false)
  const [showNetworks, setShowNetworks] = useState(false)
  const [switchingTo, setSwitchingTo] = useState<number | null>(null)
  const [networkStatus, setNetworkStatus] = useState<any>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (chainId) {
      const status = getEnhancedNetworkStatus(chainId)
      setNetworkStatus(status)
    }
  }, [chainId])

  const currentNetwork = SUPPORTED_NETWORKS.find(n => n.chainId === chainId)
  const isOnSupportedNetwork = currentNetwork?.isSupported || false

  // Enhanced network switching with comprehensive error handling
  const handleNetworkSwitch = async (targetChainId: number) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    const targetNetwork = SUPPORTED_NETWORKS.find(n => n.chainId === targetChainId)
    if (!targetNetwork) {
      toast.error('Unsupported network')
      return
    }

    // Check if already on target network
    if (chainId === targetChainId) {
      toast.success(`Already on ${targetNetwork.name} network`)
      return
    }

    setSwitchingTo(targetChainId)
    
    // Show loading toast with detailed info
    const loadingToast = toast.loading(
      `🔄 Switching to ${targetNetwork.name}...\nPlease approve in your wallet`,
      { duration: 15000 }
    )

    try {
      // Use enhanced network switching with retry logic
      const success = await switchToNetwork(targetChainId, 3)
      
      if (success) {
        toast.dismiss(loadingToast)
        toast.success(
          `✅ Successfully switched to ${targetNetwork.name}!\n${targetNetwork.icon} Ready for ${selectedToken} payments`,
          { duration: 5000 }
        )
        
        // Validate treasury address for selected token
        const treasuryAddress = getTreasuryAddressForNetwork(
          targetNetwork.name.toLowerCase(), 
          selectedToken
        )
        
        if (treasuryAddress) {
          console.log(`Treasury address for ${selectedToken} on ${targetNetwork.name}:`, treasuryAddress)
        } else {
          toast.error(`No treasury configured for ${selectedToken} on ${targetNetwork.name}`)
        }
        
        onNetworkChange?.(targetChainId)
      } else {
        throw new Error('Network switch failed')
      }

    } catch (error: any) {
      toast.dismiss(loadingToast)
      console.error('Network switch error:', error)
      
      // Enhanced error handling with specific messages
      if (error.message.includes('timeout')) {
        toast.error(
          `⏰ Network switch timed out\n💡 Try manually switching to ${targetNetwork.name} in your wallet`,
          { duration: 8000 }
        )
      } else if (error.code === 4001) {
        toast.error('Network switch cancelled by user')
      } else if (error.code === 4902) {
        toast.error(
          `${targetNetwork.name} network not found in wallet\n💡 Please add it manually or try again`,
          { duration: 6000 }
        )
      } else if (error.message.includes('rejected')) {
        toast.error('Network switch rejected by user')
      } else {
        toast.error(
          `Failed to switch to ${targetNetwork.name}\n${error.message || 'Unknown error'}`,
          { duration: 6000 }
        )
        
        // Provide manual instructions for BSC specifically
        if (targetChainId === 56) {
          setTimeout(() => {
            toast(
              `💡 Manual BSC Setup:\n1. Open MetaMask\n2. Add Network\n3. RPC: https://bsc-dataseed1.binance.org\n4. Chain ID: 56`,
              { duration: 10000, icon: '📝' }
            )
          }, 2000)
        }
      }
    } finally {
      setSwitchingTo(null)
      setShowNetworks(false)
    }
  }

  // Test network connectivity
  const testNetworkConnectivity = async (network: NetworkConfig) => {
    try {
      const response = await fetch(network.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_chainId',
          params: [],
          id: 1,
        }),
      })
      
      const data = await response.json()
      const chainIdFromRPC = parseInt(data.result, 16)
      
      return chainIdFromRPC === network.chainId
    } catch (error) {
      console.error(`Network connectivity test failed for ${network.name}:`, error)
      return false
    }
  }

  if (!isClient) {
    return (
      <div className={`bg-gray-900/50 rounded-lg p-4 animate-pulse ${className}`}>
        <div className="h-12 bg-gray-700 rounded w-full"></div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-900/90 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 shadow-xl ${className}`}>
      {/* Current Network Status */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">Network Status</h3>
          {networkStatus && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">{networkStatus.icon}</span>
              <span className={`font-semibold ${
                networkStatus.color === 'green' ? 'text-green-400' :
                networkStatus.color === 'yellow' ? 'text-yellow-400' :
                networkStatus.color === 'blue' ? 'text-blue-400' :
                networkStatus.color === 'purple' ? 'text-purple-400' :
                'text-red-400'
              }`}>
                {networkStatus.name}
              </span>
            </div>
          )}
        </div>

        {/* Network Status Indicator */}
        <div className={`p-3 rounded-lg border ${
          isOnSupportedNetwork 
            ? 'bg-green-500/20 border-green-500/40 text-green-400'
            : 'bg-red-500/20 border-red-500/40 text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              isOnSupportedNetwork ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            }`}></div>
            <span className="font-medium">
              {isOnSupportedNetwork 
                ? `Connected to ${currentNetwork?.name}` 
                : 'Unsupported Network'
              }
            </span>
          </div>
          
          {currentNetwork && (
            <div className="mt-2 text-sm opacity-80">
              <div>Chain ID: {currentNetwork.chainId}</div>
              <div>Native Token: {currentNetwork.symbol}</div>
              {selectedToken && (
                <div className="mt-1 text-xs">
                  Treasury for {selectedToken}: {
                    getTreasuryAddressForNetwork(currentNetwork.name.toLowerCase(), selectedToken) 
                      ? '✅ Configured' 
                      : '❌ Not configured'
                  }
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Network Switcher */}
      {!showNetworks ? (
        <button
          onClick={() => setShowNetworks(true)}
          disabled={!isConnected}
          className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-200 
                     touch-manipulation min-h-[48px] ${
            !isConnected
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white hover:shadow-lg'
          }`}
        >
          {!isConnected ? '❌ Connect Wallet First' : '🔄 Switch Network'}
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
          
          {SUPPORTED_NETWORKS.map((network) => {
            const isCurrentNetwork = chainId === network.chainId
            const isSwitchingToThis = switchingTo === network.chainId
            const treasuryConfigured = getTreasuryAddressForNetwork(
              network.name.toLowerCase(), 
              selectedToken
            ) !== ''

            return (
              <button
                key={network.chainId}
                onClick={() => handleNetworkSwitch(network.chainId)}
                disabled={isSwitching || isSwitchingToThis || isCurrentNetwork}
                className={`w-full flex items-center justify-between gap-3 py-4 px-4 rounded-xl 
                           transition-all duration-200 touch-manipulation min-h-[64px] font-medium
                           ${isCurrentNetwork 
                             ? 'bg-green-500/20 border-green-500/40 text-green-400 border-2' 
                             : treasuryConfigured
                             ? 'bg-gray-800/60 hover:bg-gray-700/60 border-gray-600/30 hover:border-gray-500/50 text-white border'
                             : 'bg-red-500/20 border-red-500/40 text-red-400 border cursor-not-allowed'
                           } 
                           ${(isSwitching || isSwitchingToThis) ? 'opacity-50' : 'hover:shadow-md'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{network.icon}</span>
                  <div className="text-left">
                    <div className="font-bold text-lg">{network.name}</div>
                    <div className="text-sm opacity-70">
                      {network.symbol} • Chain {network.chainId}
                    </div>
                    <div className="text-xs opacity-60">
                      {treasuryConfigured ? '✅ Treasury Ready' : '❌ No Treasury'}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  {isCurrentNetwork && (
                    <span className="text-green-400 font-bold text-xl">✓</span>
                  )}
                  {isSwitchingToThis && (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {!isCurrentNetwork && !isSwitchingToThis && treasuryConfigured && (
                    <span className="text-blue-400">→</span>
                  )}
                </div>
              </button>
            )
          })}
          
          {/* Network Information */}
          <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="text-xs text-blue-400 space-y-1">
              <div className="font-semibold mb-2">💡 Network Information:</div>
              <div>• Switch networks to use different payment tokens</div>
              <div>• Each network has dedicated treasury addresses</div>
              <div>• BSC offers lower transaction fees</div>
              <div>• Ethereum has the highest liquidity</div>
              {selectedToken && (
                <div className="mt-2 font-medium">
                  Selected Token: {selectedToken}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}