import React, { useState } from 'react'
import { toast } from 'react-hot-toast'

interface Network {
  chainId: number
  chainIdHex: string
  name: string
  rpcUrl: string
  symbol: string
  icon: string
}

const NETWORKS: Network[] = [
  {
    chainId: 424242,
    chainIdHex: '0x67932',
    name: 'BrainArk Network',
    rpcUrl: 'https://rpc.brainark.online',
    symbol: 'BAK',
    icon: '🧠'
  },
  {
    chainId: 1,
    chainIdHex: '0x1', 
    name: 'Ethereum',
    rpcUrl: 'https://ethereum-rpc.publicnode.com',
    symbol: 'ETH',
    icon: '💎'
  },
  {
    chainId: 56,
    chainIdHex: '0x38',
    name: 'BSC',
    rpcUrl: 'https://bsc-rpc.publicnode.com',
    symbol: 'BNB', 
    icon: '🟡'
  },
  {
    chainId: 137,
    chainIdHex: '0x89',
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    symbol: 'MATIC',
    icon: '🟣'
  }
]

export default function MobileNetworkSwitcher({ onNetworkChange }: { onNetworkChange?: (network: Network) => void }) {
  const [isLoading, setIsLoading] = useState<number | null>(null)
  const [currentNetwork, setCurrentNetwork] = useState<Network | null>(null)

  const switchNetwork = async (network: Network) => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask or use a Web3 browser')
      return false
    }

    setIsLoading(network.chainId)

    try {
      // Try to switch to existing network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainIdHex }],
      })
      
      setCurrentNetwork(network)
      onNetworkChange?.(network)
      toast.success(`Switched to ${network.name}`)
      return true

    } catch (switchError: any) {
      console.log('Switch failed, trying to add network:', switchError)
      
      // Network doesn't exist, try to add it
      if (switchError.code === 4902 || switchError.code === -32603) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: network.chainIdHex,
              chainName: network.name,
              nativeCurrency: {
                name: network.symbol,
                symbol: network.symbol,
                decimals: 18
              },
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: network.chainId === 424242 ? 
                ['https://explorer.brainark.online'] :
                network.chainId === 1 ? ['https://etherscan.io'] :
                network.chainId === 56 ? ['https://bscscan.com'] :
                ['https://polygonscan.com']
            }]
          })
          
          setCurrentNetwork(network)
          onNetworkChange?.(network)
          toast.success(`Added and switched to ${network.name}`)
          return true
          
        } catch (addError: any) {
          console.error('Failed to add network:', addError)
          toast.error(`Failed to add ${network.name}`)
          return false
        }
      } else {
        console.error('Network switch error:', switchError)
        toast.error(`Failed to switch to ${network.name}`)
        return false
      }
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="mobile-network-switcher bg-gray-900 rounded-xl p-4 mb-4">
      <h3 className="text-white font-semibold mb-3">Select Network</h3>
      
      <div className="grid grid-cols-2 gap-2">
        {NETWORKS.map((network) => (
          <button
            key={network.chainId}
            onClick={() => switchNetwork(network)}
            disabled={isLoading === network.chainId}
            className={`
              p-3 rounded-lg border-2 transition-all duration-200
              ${currentNetwork?.chainId === network.chainId 
                ? 'border-green-500 bg-green-500/20' 
                : 'border-gray-600 bg-gray-800 hover:border-gray-500'
              }
              ${isLoading === network.chainId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="text-2xl">{network.icon}</span>
              <span className="text-white text-sm font-medium">{network.name}</span>
              <span className="text-gray-400 text-xs">{network.symbol}</span>
              
              {isLoading === network.chainId && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              
              {currentNetwork?.chainId === network.chainId && !isLoading && (
                <div className="text-green-400 text-xs">✓ Connected</div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-400 text-center">
        Network switching optimized for mobile wallets
      </div>
    </div>
  )
}