import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useConnect, useSwitchChain } from 'wagmi'
import { useEffect, useState } from 'react'
import { brainarkChain } from '../utils/config'

interface NavigationProps {
  onNavigateToSection?: (section: string) => void
}

export default function Navigation({ onNavigateToSection }: NavigationProps) {
  const { address, isConnected, chain } = useAccount()
  const { switchChain } = useSwitchChain()
  const [showNetworkError, setShowNetworkError] = useState(false)

  // Check if connected to the wrong network
  useEffect(() => {
    if (isConnected && chain && chain.id !== brainarkChain.id) {
      setShowNetworkError(true)
    } else {
      setShowNetworkError(false)
    }
  }, [isConnected, chain])

  // Auto-switch to BrainArk network
  const handleSwitchToBrainArk = async () => {
    try {
      if (switchChain) {
        await switchChain({ chainId: brainarkChain.id })
        setShowNetworkError(false)
      }
    } catch (error) {
      console.error('Failed to switch network:', error)
      // If switching fails, try adding the network
      if (window.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x67932', // 424242 in hex
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
          console.error('Failed to add network:', addError)
        }
      }
    }
  }

  const navigationItems = [
    { id: 'hero', label: '🏠 Home' },
    { id: 'airdrop', label: '🎁 Airdrop' },
    { id: 'epo', label: '🦄 EPO' },
    { id: 'usecases', label: '🚀 Use Cases' },
    { id: 'explorer', label: '🔍 Explorer' },
    { id: 'whitepaper', label: '📄 Whitepaper' },
    { id: 'benchmark', label: '⚡ Benchmark' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              BrainArk
            </span>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigateToSection?.(item.id)}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-gray-800"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Wallet Section */}
          <div className="flex items-center space-x-4">
            {/* Network Error Warning */}
            {showNetworkError && (
              <div className="flex items-center space-x-2">
                <div className="text-amber-400 text-sm">⚠️ Wrong Network</div>
                <button
                  onClick={handleSwitchToBrainArk}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                >
                  Switch to BrainArk
                </button>
              </div>
            )}

            {/* Connect Button */}
            <div className="wallet-connect-container">
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
                              type="button"
                              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                            >
                              Connect Wallet
                            </button>
                          )
                        }

                        if (chain.unsupported) {
                          return (
                            <button
                              onClick={openChainModal}
                              type="button"
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                            >
                              Wrong Network
                            </button>
                          )
                        }

                        return (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={openChainModal}
                              className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm border border-gray-600 transition-colors duration-200"
                              type="button"
                            >
                              {chain.hasIcon && (
                                <div
                                  style={{
                                    background: chain.iconBackground,
                                    width: 12,
                                    height: 12,
                                    borderRadius: 999,
                                    overflow: 'hidden',
                                    marginRight: 4,
                                    display: 'inline-block',
                                  }}
                                >
                                  {chain.iconUrl && (
                                    <img
                                      alt={chain.name ?? 'Chain icon'}
                                      src={chain.iconUrl}
                                      style={{ width: 12, height: 12 }}
                                    />
                                  )}
                                </div>
                              )}
                              {chain.name}
                            </button>

                            <button
                              onClick={openAccountModal}
                              type="button"
                              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                            >
                              {account.displayName}
                              {account.displayBalance
                                ? ` (${account.displayBalance})`
                                : ''}
                            </button>
                          </div>
                        )
                      })()}
                    </div>
                  )
                }}
              </ConnectButton.Custom>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-300 hover:text-white p-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
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
