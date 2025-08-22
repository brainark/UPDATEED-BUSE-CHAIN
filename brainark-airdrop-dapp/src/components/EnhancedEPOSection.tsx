import React, { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { toast } from 'react-hot-toast'
import { EPO_CONFIG } from '@/utils/config'
import { networkDetector, switchToCorrectNetwork } from '@/utils/networkDetection'
import AutoWalletConnection from './AutoWalletConnection'

interface SupportedToken {
  symbol: string
  name: string
  icon: string
  price: number
  change24h: number
  color: string
  address: string
  liquidity: number
  volume24h: number
  fees: number
}

const EnhancedEPOSection: React.FC = () => {
  const { address, isConnected } = useAccount()
  const [selectedToken, setSelectedToken] = useState<string>('USDT')
  const [purchaseAmount, setPurchaseAmount] = useState<string>('')
  const [bakAmount, setBakAmount] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [transactions, setTransactions] = useState<any[]>([])
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [totalSold, setTotalSold] = useState<number>(0)
  const [slippage, setSlippage] = useState<number>(0.5)
  const [priceImpact, setPriceImpact] = useState<number>(0)
  const [quickActionsOpen, setQuickActionsOpen] = useState<boolean>(false)

  // Enhanced EPO Configuration
  const BAK_PRICE = EPO_CONFIG.PRICE_START // Use starting price for display
  const TOTAL_EPO_SUPPLY = EPO_CONFIG.TOTAL_SUPPLY
  const EPO_DURATION_DAYS = EPO_CONFIG.DURATION_DAYS
  const EPO_START_DATE = EPO_CONFIG.START_DATE
  const EPO_END_DATE = new Date(EPO_START_DATE.getTime() + (EPO_DURATION_DAYS * 24 * 60 * 60 * 1000))

  // Supported tokens with enhanced configuration
  const supportedTokens: Record<string, SupportedToken> = {
    USDT: {
      symbol: 'USDT',
      name: 'Tether USD',
      icon: '💵',
      price: 1.00,
      change24h: 0.01,
      color: '#26a17b',
      address: '0xA0b86a33E6441E6C8C7F1C7C8C7F1C7C8C7F1C7C',
      liquidity: 2500000,
      volume24h: 150000,
      fees: 0.05
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin',
      icon: '💰',
      price: 1.00,
      change24h: -0.02,
      color: '#2775ca',
      address: '0xB0b86a33E6441E6C8C7F1C7C8C7F1C7C8C7F1C7C',
      liquidity: 1800000,
      volume24h: 120000,
      fees: 0.05
    },
    BNB: {
      symbol: 'BNB',
      name: 'Binance Coin',
      icon: '🟡',
      price: 635.50,
      change24h: 2.45,
      color: '#f3ba2f',
      address: '0xC0b86a33E6441E6C8C7F1C7C8C7F1C7C8C7F1C7C',
      liquidity: 850000,
      volume24h: 95000,
      fees: 0.3
    },
    ETH: {
      symbol: 'ETH',
      name: 'Ethereum',
      icon: '💎',
      price: 3420.75,
      change24h: 1.85,
      color: '#627eea',
      address: '0xD0b86a33E6441E6C8C7F1C7C8C7F1C7C8C7F1C7C',
      liquidity: 1200000,
      volume24h: 180000,
      fees: 0.3
    }
  }

  // Calculate time remaining and update countdown
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const remaining = EPO_END_DATE.getTime() - now.getTime()
      
      if (remaining > 0) {
        setTimeRemaining(remaining)
      } else {
        setTimeRemaining(0)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  // Format time remaining
  const formatTimeRemaining = (milliseconds: number | null): string => {
    if (!milliseconds || milliseconds <= 0) return 'EPO Ended'
    
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24))
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`
  }

  // Calculate total sold from transactions
  useEffect(() => {
    const sold = transactions.reduce((sum, tx) => sum + tx.bakAmount, 0)
    setTotalSold(sold)
  }, [transactions])

  // Check if EPO can be extended
  const canExtendEPO = (): boolean => {
    return timeRemaining !== null && timeRemaining <= 0 && totalSold < TOTAL_EPO_SUPPLY
  }

  // Enhanced Quick Actions Component - Smaller and Toggleable
  const QuickActionsTab: React.FC = () => {
    const quickActions = [
      { label: '💵 $100 USDT', token: 'USDT', amount: '100' },
      { label: '💎 0.1 ETH', token: 'ETH', amount: '0.1' },
      { label: '🟡 1 BNB', token: 'BNB', amount: '1' },
      { 
        label: '🚀 Max', 
        token: 'USDT', 
        amount: Math.min(1000, (TOTAL_EPO_SUPPLY - totalSold) * BAK_PRICE).toString() 
      }
    ]

    return (
      <div className="fixed top-4 right-4 z-50">
        {/* Toggle Button */}
        <button
          onClick={() => setQuickActionsOpen(!quickActionsOpen)}
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-3 py-2 rounded-lg shadow-lg transition-all duration-200 mb-2 text-sm font-medium"
        >
          ⚡ Quick Actions {quickActionsOpen ? '▼' : '▶'}
        </button>

        {/* Quick Actions Panel */}
        {quickActionsOpen && (
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 text-white rounded-lg shadow-2xl border border-indigo-500 backdrop-blur-sm p-3 min-w-[180px] animate-fade-in">
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="bg-indigo-500 hover:bg-indigo-400 text-white font-medium py-2 px-3 rounded text-xs transition-all duration-200 hover:scale-105"
                  onClick={() => {
                    setSelectedToken(action.token)
                    setPurchaseAmount(action.amount)
                    toast.success(`Set ${action.amount} ${action.token}`)
                    setQuickActionsOpen(false) // Close after selection
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // EPO Time Limit Display
  const EPOTimeLimitDisplay: React.FC = () => {
    const progressPercentage = (totalSold / TOTAL_EPO_SUPPLY) * 100
    
    return (
      <div className="card-brilliant p-6 mb-6">
        <h3 className="text-2xl font-bold text-center mb-4 text-gray-900">
          ⏰ EPO Time Limit & Progress
        </h3>
        <div className="epo-time-display text-center mb-4">
          {formatTimeRemaining(timeRemaining)}
        </div>
        <div className="space-y-2">
          <div className="text-center text-gray-700 font-medium">
            {totalSold.toLocaleString()} / {TOTAL_EPO_SUPPLY.toLocaleString()} BAK Sold ({progressPercentage.toFixed(2)}%)
          </div>
          <div className="epo-progress-bar">
            <div 
              className="epo-progress-fill" 
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>
        {canExtendEPO() && (
          <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg text-center">
            <p className="text-blue-800 font-semibold">
              🔄 EPO can be extended as 100M coins target not reached!
            </p>
          </div>
        )}
      </div>
    )
  }

  // Calculate BAK tokens and price impact
  useEffect(() => {
    if (purchaseAmount && !isNaN(parseFloat(purchaseAmount))) {
      const selectedTokenData = supportedTokens[selectedToken]
      const usdValue = parseFloat(purchaseAmount) * selectedTokenData.price
      const bakTokens = usdValue / BAK_PRICE
      
      // Calculate price impact based on liquidity
      const impact = (usdValue / selectedTokenData.liquidity) * 100
      setPriceImpact(Math.min(impact, 15)) // Cap at 15%
      
      setBakAmount(bakTokens.toFixed(2))
    } else {
      setBakAmount('')
      setPriceImpact(0)
    }
  }, [purchaseAmount, selectedToken])

  // Enhanced Purchase Function
  const purchaseBAK = async (): Promise<void> => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!purchaseAmount || parseFloat(purchaseAmount) <= 0) {
      toast.error('Please enter a valid purchase amount')
      return
    }

    if (timeRemaining !== null && timeRemaining <= 0 && !canExtendEPO()) {
      toast.error('EPO has ended and cannot be extended')
      return
    }

    if (totalSold >= TOTAL_EPO_SUPPLY) {
      toast.error('All EPO tokens have been sold')
      return
    }

    if (priceImpact > 5) {
      const confirmed = window.confirm(
        `High price impact detected (${priceImpact.toFixed(2)}%). Do you want to continue?`
      )
      if (!confirmed) return
    }

    setIsProcessing(true)

    try {
      const selectedTokenData = supportedTokens[selectedToken]
      const tokenAmount = parseFloat(purchaseAmount)
      const usdValue = tokenAmount * selectedTokenData.price
      let bakTokens = usdValue / BAK_PRICE
      
      // Check if purchase would exceed available supply
      if (totalSold + bakTokens > TOTAL_EPO_SUPPLY) {
        const maxPossible = TOTAL_EPO_SUPPLY - totalSold
        const confirmed = window.confirm(
          `Only ${maxPossible.toFixed(2)} BAK tokens remaining. Purchase ${maxPossible.toFixed(2)} BAK instead?`
        )
        if (!confirmed) {
          setIsProcessing(false)
          return
        }
        bakTokens = maxPossible
      }
      
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const transaction = {
        id: Date.now().toString(),
        from: address,
        tokenUsed: selectedToken,
        tokenAmount: tokenAmount,
        usdValue: usdValue,
        bakAmount: bakTokens,
        priceImpact: priceImpact,
        slippage: slippage,
        fees: (usdValue * selectedTokenData.fees) / 100,
        timestamp: new Date().toISOString(),
        status: 'completed',
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        gasUsed: Math.floor(Math.random() * 50000) + 150000,
        gasPrice: Math.floor(Math.random() * 20) + 20
      }

      const updatedTransactions = [...transactions, transaction]
      setTransactions(updatedTransactions)
      localStorage.setItem('epoTransactions', JSON.stringify(updatedTransactions))

      toast.success(
        `Successfully purchased ${bakTokens.toFixed(2)} BAK tokens!\nPrice Impact: ${priceImpact.toFixed(3)}%\nFees: $${transaction.fees.toFixed(4)}`
      )
      
      // Reset form
      setPurchaseAmount('')
      setBakAmount('')
      setPriceImpact(0)

    } catch (error) {
      console.error('Purchase failed:', error)
      toast.error('Purchase failed. Please try again.')
    }

    setIsProcessing(false)
  }

  // Load transactions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('epoTransactions')
    if (stored) {
      setTransactions(JSON.parse(stored))
    }
  }, [])

  // Get user's transactions
  const userTransactions = transactions.filter(tx => 
    tx.from?.toLowerCase() === address?.toLowerCase()
  )

  const totalBakPurchased = userTransactions.reduce((sum, tx) => sum + tx.bakAmount, 0)
  const totalUsdSpent = userTransactions.reduce((sum, tx) => sum + tx.usdValue, 0)
  const totalFeesPaid = userTransactions.reduce((sum, tx) => sum + (tx.fees || 0), 0)

  return (
    <div className="min-h-screen bg-deep-black py-8">
      {/* ENHANCED QUICK ACTIONS TAB - SMALLER AND TOGGLEABLE */}
      <QuickActionsTab />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 bg-clip-text text-transparent">
            🦄 BrainArk EPO - Enhanced Trading Platform
          </h1>
          <p className="text-xl text-gray-300">
            Advanced trading interface with 30-day time limit and 100M BAK token supply
          </p>
        </div>

        {/* EPO TIME LIMIT AND PROGRESS DISPLAY */}
        <EPOTimeLimitDisplay />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trading Section */}
          <div className="lg:col-span-2">
            <div className="card-dark p-6">
              <h2 className="text-2xl font-bold mb-6 text-white">
                🔄 Enhanced Trading Interface
              </h2>
              
              {!isConnected ? (
                <div className="text-center py-12">
                  <p className="text-gray-300 mb-6">
                    Connect your wallet to access enhanced trading features
                  </p>
                  <AutoWalletConnection />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Wallet Summary */}
                  <div className="card-brilliant p-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      👛 Trading Dashboard
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Connected:</div>
                        <div className="font-mono text-sm">
                          {address?.slice(0, 6)}...{address?.slice(-4)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">BAK Purchased:</div>
                        <div className="font-semibold">{totalBakPurchased.toFixed(2)} BAK</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Total Spent:</div>
                        <div className="font-semibold">${totalUsdSpent.toFixed(2)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Fees Paid:</div>
                        <div className="font-semibold">${totalFeesPaid.toFixed(4)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Token Selection */}
                  <div className="card-brilliant p-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      💱 Select Payment Token
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(supportedTokens).map(([key, token]) => (
                        <div
                          key={key}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            selectedToken === key
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedToken(key)}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{token.icon}</span>
                            <div>
                              <div className="font-semibold text-gray-900">{token.symbol}</div>
                              <div className="text-sm text-gray-600">{token.name}</div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="font-semibold text-gray-900">
                              ${token.price.toFixed(2)}
                            </div>
                            <div className={`text-sm font-medium ${
                              token.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500 space-y-1">
                            <div>Liquidity: ${token.liquidity.toLocaleString()}</div>
                            <div>24h Vol: ${token.volume24h.toLocaleString()}</div>
                            <div>Fee: {token.fees}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trading Calculator */}
                  <div className="card-brilliant p-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      🧮 Enhanced Trading Calculator
                    </h3>
                    
                    {/* Slippage Settings */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slippage Tolerance:
                      </label>
                      <div className="flex gap-2 items-center">
                        {[0.1, 0.5, 1.0, 3.0].map(value => (
                          <button
                            key={value}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                              slippage === value
                                ? 'bg-teal-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => setSlippage(value)}
                          >
                            {value}%
                          </button>
                        ))}
                        <input
                          type="number"
                          value={slippage}
                          onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                          placeholder="Custom"
                          step="0.1"
                          min="0.1"
                          max="50"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount of {selectedToken} to spend:
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                            {supportedTokens[selectedToken].icon}
                          </span>
                          <input
                            type="number"
                            value={purchaseAmount}
                            onChange={(e) => setPurchaseAmount(e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step={selectedToken === 'USDT' || selectedToken === 'USDC' ? '0.01' : '0.001'}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:ring-teal-500 focus:border-teal-500"
                          />
                          <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md">
                            {selectedToken}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl text-teal-500">↓</div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          BAK tokens you will receive:
                        </label>
                        <div className="flex items-center gap-2 p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                          <span className="text-xl">🪙</span>
                          <span className="text-xl font-bold text-green-600">
                            {bakAmount || '0.00'}
                          </span>
                          <span className="text-gray-600">BAK</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price Impact Warning */}
                    {priceImpact > 0 && (
                      <div className={`p-3 rounded-lg mb-4 ${
                        priceImpact > 3 ? 'bg-red-50 border border-red-200' :
                        priceImpact > 1 ? 'bg-yellow-50 border border-yellow-200' :
                        'bg-green-50 border border-green-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span>⚠️ Price Impact: </span>
                          <strong>{priceImpact.toFixed(3)}%</strong>
                        </div>
                        {priceImpact > 5 && (
                          <p className="text-sm mt-1">
                            High price impact! Consider reducing your trade size.
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Transaction Details */}
                    {purchaseAmount && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">📋 Transaction Details:</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Input:</span>
                            <span>{purchaseAmount} {selectedToken}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>USD Value:</span>
                            <span>${(parseFloat(purchaseAmount || '0') * supportedTokens[selectedToken].price).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>BAK Output:</span>
                            <span>{bakAmount} BAK</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Trading Fee:</span>
                            <span>${((parseFloat(purchaseAmount || '0') * supportedTokens[selectedToken].price * supportedTokens[selectedToken].fees) / 100).toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Price Impact:</span>
                            <span>{priceImpact.toFixed(3)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Slippage Tolerance:</span>
                            <span>{slippage}%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Purchase Button */}
                    <button
                      onClick={purchaseBAK}
                      disabled={
                        !purchaseAmount || 
                        parseFloat(purchaseAmount) <= 0 || 
                        isProcessing || 
                        (timeRemaining !== null && timeRemaining <= 0 && !canExtendEPO()) || 
                        totalSold >= TOTAL_EPO_SUPPLY
                      }
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                        isProcessing ? 'btn-warning' :
                        (timeRemaining !== null && timeRemaining <= 0 && !canExtendEPO()) ? 'bg-gray-400 text-gray-700 cursor-not-allowed' :
                        totalSold >= TOTAL_EPO_SUPPLY ? 'bg-gray-400 text-gray-700 cursor-not-allowed' :
                        priceImpact > 5 ? 'btn-warning' :
                        'btn-success'
                      }`}
                    >
                      {isProcessing ? '⏳ Processing Transaction...' : 
                       (timeRemaining !== null && timeRemaining <= 0 && !canExtendEPO()) ? '⏰ EPO Ended' :
                       totalSold >= TOTAL_EPO_SUPPLY ? '🔒 All Tokens Sold' :
                       priceImpact > 5 ? `⚠️ Buy Anyway (${priceImpact.toFixed(2)}% impact)` :
                       `🛒 Buy ${bakAmount || '0'} BAK with ${purchaseAmount || '0'} ${selectedToken}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <div className="card-dark p-6">
              <h2 className="text-xl font-bold mb-4 text-white">Enhanced EPO Information</h2>
              <div className="space-y-4">
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-400">Token Price</div>
                  <div className="font-semibold text-white">$0.02 per BAK</div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-400">Total Supply</div>
                  <div className="font-semibold text-white">100M BAK Tokens</div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-400">Tokens Sold</div>
                  <div className="font-semibold text-white">{totalSold.toFixed(0)} BAK</div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-400">Time Remaining</div>
                  <div className="font-semibold text-white">{formatTimeRemaining(timeRemaining)}</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-white mb-3">Enhanced EPO Features:</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 100 Million BAK tokens available</li>
                  <li>• 30-day time limit with extension possibility</li>
                  <li>• Multiple payment tokens supported</li>
                  <li>• Real-time price impact calculation</li>
                  <li>• Advanced slippage protection</li>
                  <li>• Quick action buttons for fast trading</li>
                  <li>• Professional trading interface</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        {userTransactions.length > 0 && (
          <div className="mt-8 card-dark p-6">
            <h2 className="text-xl font-bold mb-4 text-white">📊 Enhanced Trading History</h2>
            <div className="space-y-4">
              {userTransactions.map((tx) => (
                <div key={tx.id} className="card-brilliant p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-green-600 text-lg">
                        {tx.bakAmount.toFixed(2)} BAK
                      </div>
                      <div className="text-gray-600">
                        {tx.tokenAmount.toFixed(4)} {tx.tokenUsed} (${tx.usdValue.toFixed(2)})
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {tx.status}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
                    <div>Price Impact: {(tx.priceImpact || 0).toFixed(3)}%</div>
                    <div>Fees: ${(tx.fees || 0).toFixed(4)}</div>
                    <div>Gas: {(tx.gasUsed || 0).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 card-brilliant p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600">Total BAK Purchased:</div>
                  <div className="font-semibold text-green-600">{totalBakPurchased.toFixed(2)} BAK</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Amount Spent:</div>
                  <div className="font-semibold">${totalUsdSpent.toFixed(2)} USD</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Fees Paid:</div>
                  <div className="font-semibold">${totalFeesPaid.toFixed(4)} USD</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Average Price:</div>
                  <div className="font-semibold">
                    ${totalUsdSpent > 0 ? (totalUsdSpent / totalBakPurchased).toFixed(4) : '0.0000'} per BAK
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedEPOSection