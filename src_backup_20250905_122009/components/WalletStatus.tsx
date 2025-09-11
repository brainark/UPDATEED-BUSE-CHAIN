import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { useEffect, useState } from 'react'
import { brainarkChain } from '../utils/config'

export default function WalletStatus() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [showSwitchPrompt, setShowSwitchPrompt] = useState(false)

  const isCorrectNetwork = chainId === brainarkChain.id

  useEffect(() => {
    if (isConnected && !isCorrectNetwork) {
      setShowSwitchPrompt(true)
    } else {
      setShowSwitchPrompt(false)
    }
  }, [isConnected, isCorrectNetwork])

  const handleSwitchNetwork = async () => {
    try {
      if (switchChain) {
        await switchChain({ chainId: brainarkChain.id })
      } else if (window.ethereum) {
        // Fallback to direct MetaMask call
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x67932' }], // 424242 in hex
        })
      }
    } catch (error: any) {
      // If the chain doesn't exist, add it
      if (error.code === 4902 && window.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x67932',
              chainName: 'BrainArk Network',
              nativeCurrency: {
                name: 'BAK',
                symbol: 'BAK',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.brainark.online'],
              blockExplorerUrls: ['https://explorer.brainark.online'],
            }],
          })
        } catch (addError) {
          console.error('Failed to add BrainArk network:', addError)
        }
      } else {
        console.error('Failed to switch network:', error)
      }
    }
  }

  if (!isConnected) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Connection Status */}
      <div className="bg-black/80 backdrop-blur-md rounded-lg p-4 border border-gray-700 max-w-sm">
        {/* Wallet Address */}
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-300">Connected</span>
        </div>
        
        <div className="text-xs font-mono text-gray-400 mb-3">
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown'}
        </div>

        {/* Network Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Network:</span>
            <span className={`text-sm font-medium ${isCorrectNetwork ? 'text-green-400' : 'text-amber-400'}`}>
              {isCorrectNetwork ? 'BrainArk' : `Chain ${chainId}`}
            </span>
          </div>

          {/* Switch Network Button */}
          {showSwitchPrompt && (
            <div className="pt-2 border-t border-gray-600">
              <div className="text-xs text-amber-400 mb-2">
                ⚠️ Please switch to BrainArk Network
              </div>
              <button
                onClick={handleSwitchNetwork}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm py-2 px-3 rounded transition-colors duration-200"
              >
                Switch to BrainArk
              </button>
            </div>
          )}

          {/* Success indicator */}
          {isCorrectNetwork && (
            <div className="pt-2 border-t border-gray-600">
              <div className="text-xs text-green-400 flex items-center">
                ✅ Ready for BrainArk dApps
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

declare global {
  interface Window {
    ethereum?: any
  }
}
