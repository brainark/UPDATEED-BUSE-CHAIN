import React, { useState, useEffect, useMemo } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { toast } from 'react-hot-toast'
import { useEnhancedEPOContract } from '@/hooks/useEnhancedEPOContract'
import EnhancedNetworkSwitcher from './EnhancedNetworkSwitcher'
import WagmiConnectButton from "@/components/WagmiConnectButton"
import { getTreasuryAddressForNetwork } from '@/utils/enhancedWagmiConfig'

interface TokenInfo {
  symbol: string
  name: string
  icon: string
  price: number
  change24h: number
  decimals: number
  isNative: boolean
}

interface NetworkTokens {
  [key: string]: TokenInfo[]
}

const NETWORK_TOKENS: NetworkTokens = {
  ethereum: [
    { symbol: 'ETH', name: 'Ethereum', icon: '💎', price: 3420.75, change24h: 1.85, decimals: 18, isNative: true },
    { symbol: 'USDT', name: 'Tether USD', icon: '💵', price: 1.00, change24h: 0.01, decimals: 6, isNative: false },
    { symbol: 'USDC', name: 'USD Coin', icon: '🔵', price: 1.00, change24h: -0.02, decimals: 6, isNative: false },
  ],
  bsc: [
    { symbol: 'BNB', name: 'Binance Coin', icon: '🟡', price: 635.50, change24h: 2.45, decimals: 18, isNative: true },
    { symbol: 'USDT', name: 'Tether USD (BSC)', icon: '💵', price: 1.00, change24h: 0.01, decimals: 18, isNative: false },
    { symbol: 'USDC', name: 'USD Coin (BSC)', icon: '🔵', price: 1.00, change24h: -0.02, decimals: 18, isNative: false },
  ],
  polygon: [
    { symbol: 'MATIC', name: 'Polygon', icon: '🟣', price: 0.85, change24h: 1.25, decimals: 18, isNative: true },
    { symbol: 'USDT', name: 'Tether USD (Polygon)', icon: '💵', price: 1.00, change24h: 0.01, decimals: 6, isNative: false },
    { symbol: 'USDC', name: 'USD Coin (Polygon)', icon: '🔵', price: 1.00, change24h: -0.02, decimals: 6, isNative: false },
  ],
}

const QUICK_AMOUNTS = [
  { label: '$100', value: '100' },
  { label: '$500', value: '500' },
  { label: '$1K', value: '1000' },
  { label: '$5K', value: '5000' },
  { label: '$10K', value: '10000' },
  { label: '$50K', value: '50000' },
]

export default function EnhancedEPOTradingPanel() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  
  const [selectedNetwork, setSelectedNetwork] = useState<string>('ethereum')
  const [selectedToken, setSelectedToken] = useState<string>('USDT')
  const [paymentAmount, setPaymentAmount] = useState<string>('')
  const [bakAmount, setBakAmount] = useState<string>('')
  const [showQuickActions, setShowQuickActions] = useState<boolean>(false)
  
  const { stats, isLoading, error, refetch, purchaseBAK, isTransactionPending } = useEnhancedEPOContract()

  // Get current network name
  const currentNetworkName = useMemo(() => {
    switch (chainId) {
      case 1: return 'ethereum'
      case 56: return 'bsc'
      case 137: return 'polygon'
      case 424242: return 'brainark'
      default: return 'unknown'
    }
  }, [chainId])

  // Get available tokens for selected network
  const availableTokens = useMemo(() => {
    return NETWORK_TOKENS[selectedNetwork] || []
  }, [selectedNetwork])

  // Calculate BAK amount based on payment
  useEffect(() => {
    if (paymentAmount && !isNaN(parseFloat(paymentAmount)) && stats?.price) {
      const selectedTokenInfo = availableTokens.find(t => t.symbol === selectedToken)
      if (selectedTokenInfo) {
        const usdValue = parseFloat(paymentAmount) * selectedTokenInfo.price
        const currentPrice = parseFloat(stats.price)
        const calculatedBAK = usdValue / currentPrice
        setBakAmount(calculatedBAK.toFixed(2))
      }
    } else {
      setBakAmount('')
    }
  }, [paymentAmount, selectedToken, stats?.price, availableTokens])

  // Handle network change
  const handleNetworkChange = (newChainId: number) => {
    const networkMap: Record<number, string> = {
      1: 'ethereum',
      56: 'bsc',
      137: 'polygon',
      424242: 'brainark',
    }
    
    const newNetwork = networkMap[newChainId]
    if (newNetwork && newNetwork !== 'brainark') {
      setSelectedNetwork(newNetwork)
      
      // Reset token selection if not available on new network
      const newNetworkTokens = NETWORK_TOKENS[newNetwork] || []
      if (!newNetworkTokens.find(t => t.symbol === selectedToken)) {
        setSelectedToken(newNetworkTokens[0]?.symbol || 'USDT')
      }
    }
  }

  // Handle purchase
  const handlePurchase = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount')
      return
    }

    if (currentNetworkName !== selectedNetwork) {
      toast.error(`Please switch to ${selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)} network`)
      return
    }

    if (!stats?.isActive) {
      toast.error('EPO is not currently active')
      return
    }

    try {
      const result = await purchaseBAK(paymentAmount, selectedToken, selectedNetwork)
      
      if (result.success) {
        // Reset form on success
        setPaymentAmount('')
        setBakAmount('')
        
        // Refresh stats
        setTimeout(() => {
          refetch()
        }, 3000)
      }
    } catch (error: any) {
      console.error('Purchase error:', error)
      toast.error(error.message || 'Purchase failed')
    }
  }

  // Handle quick amount selection
  const handleQuickAmount = (amount: string) => {
    const selectedTokenInfo = availableTokens.find(t => t.symbol === selectedToken)
    if (selectedTokenInfo) {
      const tokenAmount = parseFloat(amount) / selectedTokenInfo.price
      setPaymentAmount(tokenAmount.toFixed(6))
    }
    setShowQuickActions(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          🚀 Enhanced EPO Trading Panel
        </h1>
        <p className="text-gray-300 text-lg">
          Buy BAK tokens with multiple cryptocurrencies across different networks
        </p>
      </div>

      {/* EPO Stats */}
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4">📊 EPO Statistics</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-6 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4 text-red-400">
            <div className="font-semibold mb-2">⚠️ Contract Error</div>
            <div className="text-sm">{error}</div>
            <button
              onClick={refetch}
              className="mt-3 px-4 py-2 bg-red-500/30 hover:bg-red-500/40 rounded-lg text-sm font-medium transition-colors"
            >
              🔄 Retry
            </button>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-4 text-center">
              <div className="text-green-400 text-sm font-medium">BAK Price</div>
              <div className="text-white text-xl font-bold">${parseFloat(stats.price).toFixed(4)}</div>
            </div>
            
            <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-4 text-center">
              <div className="text-blue-400 text-sm font-medium">Total Sold</div>
              <div className="text-white text-xl font-bold">{parseFloat(stats.totalSold).toLocaleString()}</div>
            </div>
            
            <div className="bg-purple-500/20 border border-purple-500/40 rounded-lg p-4 text-center">
              <div className="text-purple-400 text-sm font-medium">Remaining</div>
              <div className="text-white text-xl font-bold">{parseFloat(stats.remainingSupply).toLocaleString()}</div>
            </div>
            
            <div className="bg-orange-500/20 border border-orange-500/40 rounded-lg p-4 text-center">
              <div className="text-orange-400 text-sm font-medium">Status</div>
              <div className={`text-xl font-bold ${stats.isActive ? 'text-green-400' : 'text-red-400'}`}>
                {stats.isActive ? '🟢 Active' : '🔴 Inactive'}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Switcher */}
        <div className="lg:col-span-1">
          <EnhancedNetworkSwitcher
            onNetworkChange={handleNetworkChange}
            selectedToken={selectedToken}
          />
        </div>

        {/* Trading Interface */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-6">💰 Buy BAK Tokens</h2>

            {!isConnected ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">Connect your wallet to start trading</div>
                <div className="text-sm text-gray-500">
                  <WagmiConnectButton className="mx-auto" />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Token Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Select Payment Token on {selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {availableTokens.map((token) => {
                      const treasuryConfigured = getTreasuryAddressForNetwork(selectedNetwork, token.symbol) !== ''
                      
                      return (
                        <button
                          key={token.symbol}
                          onClick={() => setSelectedToken(token.symbol)}
                          disabled={!treasuryConfigured}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            selectedToken === token.symbol
                              ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                              : treasuryConfigured
                              ? 'border-gray-600 bg-gray-800/50 text-white hover:border-gray-500'
                              : 'border-red-500/50 bg-red-500/10 text-red-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{token.icon}</span>
                            <div className="text-left">
                              <div className="font-semibold">{token.symbol}</div>
                              <div className="text-xs opacity-70">{token.name}</div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span>${token.price.toFixed(2)}</span>
                            <span className={`${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                            </span>
                          </div>
                          {!treasuryConfigured && (
                            <div className="text-xs text-red-400 mt-2">❌ No Treasury</div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Amount Input */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Payment Amount ({selectedToken})
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.000001"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      />
                      <div className="absolute right-3 top-3 text-gray-400 text-sm">
                        {selectedToken}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      BAK Tokens You'll Receive
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={bakAmount}
                        readOnly
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-green-400 placeholder-gray-400 cursor-not-allowed"
                      />
                      <div className="absolute right-3 top-3 text-gray-400 text-sm">
                        BAK
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-300">Quick Amounts</label>
                    <button
                      onClick={() => setShowQuickActions(!showQuickActions)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      {showQuickActions ? 'Hide' : 'Show'} Quick Actions
                    </button>
                  </div>
                  
                  {showQuickActions && (
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {QUICK_AMOUNTS.map((amount) => (
                        <button
                          key={amount.value}
                          onClick={() => handleQuickAmount(amount.value)}
                          className="px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-all duration-200"
                        >
                          {amount.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Network Mismatch Warning */}
                {currentNetworkName !== selectedNetwork && currentNetworkName !== 'unknown' && (
                  <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-4 text-yellow-400">
                    <div className="font-semibold mb-2">⚠️ Network Mismatch</div>
                    <div className="text-sm">
                      You're on {currentNetworkName} but selected {selectedNetwork}. 
                      Please switch networks using the switcher above.
                    </div>
                  </div>
                )}

                {/* Purchase Button */}
                <button
                  onClick={handlePurchase}
                  disabled={
                    !paymentAmount || 
                    parseFloat(paymentAmount) <= 0 || 
                    isTransactionPending || 
                    !stats?.isActive ||
                    currentNetworkName !== selectedNetwork
                  }
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 ${
                    isTransactionPending
                      ? 'bg-yellow-500/50 text-yellow-200 cursor-not-allowed'
                      : !stats?.isActive
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : currentNetworkName !== selectedNetwork
                      ? 'bg-orange-500/50 text-orange-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:shadow-lg transform hover:scale-105'
                  }`}
                >
                  {isTransactionPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-yellow-200 border-t-transparent rounded-full animate-spin"></div>
                      Processing Transaction...
                    </div>
                  ) : !stats?.isActive ? (
                    '🔒 EPO Not Active'
                  ) : currentNetworkName !== selectedNetwork ? (
                    `🔄 Switch to ${selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)}`
                  ) : (
                    `🚀 Buy ${bakAmount || '0'} BAK with ${selectedToken}`
                  )}
                </button>

                {/* Transaction Info */}
                {paymentAmount && bakAmount && stats && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="text-blue-400 font-semibold mb-2">📋 Transaction Summary</div>
                    <div className="space-y-1 text-sm text-gray-300">
                      <div className="flex justify-between">
                        <span>Payment:</span>
                        <span>{paymentAmount} {selectedToken}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>BAK Tokens:</span>
                        <span>{bakAmount} BAK</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price per BAK:</span>
                        <span>${parseFloat(stats.price).toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Network:</span>
                        <span>{selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Treasury:</span>
                        <span className="font-mono text-xs">
                          {getTreasuryAddressForNetwork(selectedNetwork, selectedToken)?.slice(0, 10)}...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}