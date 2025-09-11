import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { useState, useEffect } from 'react'
import { brainarkChain } from '../utils/config'
import { NavigationShader } from './shaders'

export default function NavigationFixed() {
  const { address, isConnected, isConnecting } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [isNetworkSwitching, setIsNetworkSwitching] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const isCorrectNetwork = chainId === brainarkChain.id

  useEffect(() => {
    // Check if mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSwitchNetwork = async () => {
    if (isNetworkSwitching) return
    
    setIsNetworkSwitching(true)
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
      }
    } finally {
      setIsNetworkSwitching(false)
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-800 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              BrainArk
            </h1>
          </div>

          {/* Connection Status & Connect Button */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Network Status */}
            {isConnected && (
              <div className={`hidden sm:flex items-center space-x-2 px-2 py-1 rounded-full text-xs ${
                isCorrectNetwork ? 'bg-green-900/50 text-green-400' : 'bg-amber-900/50 text-amber-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isCorrectNetwork ? 'bg-green-400' : 'bg-amber-400'}`} />
                <span>{isCorrectNetwork ? 'BrainArk' : 'Wrong Network'}</span>
              </div>
            )}

            {/* Wrong Network Button */}
            {isConnected && !isCorrectNetwork && (
              <button
                onClick={handleSwitchNetwork}
                disabled={isNetworkSwitching}
                className={`
                  px-3 py-1 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm
                  ${isNetworkSwitching
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-amber-600 text-white hover:bg-amber-700'
                  }
                `}
              >
                {isNetworkSwitching ? 'Switching...' : 'Switch Network'}
              </button>
            )}

            {/* Connect Button */}
            <div className="connect-button-container">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  const ready = mounted && authenticationStatus !== 'loading'
                  const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus || authenticationStatus === 'authenticated')

                  return (
                    <div
                      {...(!ready && {
                        'aria-hidden': true,
                        style: {
                          opacity: 0,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <button
                              onClick={openConnectModal}
                              disabled={isConnecting}
                              className={`
                                px-4 py-2 rounded-lg font-medium transition-all duration-200
                                ${isMobile ? 'text-sm px-3 py-2' : 'text-sm px-4 py-2'}
                                ${isConnecting 
                                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg'
                                }
                              `}
                            >
                              {isConnecting ? 'Connecting...' : isMobile ? 'Connect' : 'Connect Wallet'}
                            </button>
                          )
                        }

                        return (
                          <button
                            onClick={openAccountModal}
                            className={`
                              px-3 py-2 rounded-lg font-medium transition-all duration-200
                              ${isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-2'}
                              bg-gray-800 text-white hover:bg-gray-700 border border-gray-600
                            `}
                          >
                            {isMobile 
                              ? `${account?.displayName?.slice(0, 6)}...` 
                              : account?.displayName
                            }
                          </button>
                        )
                      })()}
                    </div>
                  )
                }}
              </ConnectButton.Custom>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

declare global {
  interface Window {
    ethereum?: any
  }
}
