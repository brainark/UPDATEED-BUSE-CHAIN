import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { EPO_CONFIG } from '@/utils/config'
import AutoWalletConnection from './AutoWalletConnection'
import { CheckCircleIcon, XCircleIcon, ClockIcon, UserGroupIcon, ExclamationTriangleIcon, ShareIcon, LinkIcon, CalendarIcon, TrendingUpIcon, TrendingDownIcon } from '@heroicons/react/24/outline'

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
  decimals: number
}

interface BondingCurveData {
  currentPrice: number
  nextPrice: number
  priceImpact: number
  totalSupply: number
  circulatingSupply: number
  marketCap: number
  liquidityPool: number
}

const EnhancedEPOWithBondingCurve: React.FC = () => {
  const [address, setAddress] = useState<string>('')
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false)
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
  const [bondingCurve, setBondingCurve] = useState<BondingCurveData>({
    currentPrice: 0.02,
    nextPrice: 0.02,
    priceImpact: 0,
    totalSupply: 100000000,
    circulatingSupply: 0,
    marketCap: 0,
    liquidityPool: 2000000
  })
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy')

  // Enhanced EPO Configuration with Bonding Curve
  const MIN_PRICE = 0.015 // $0.015
  const MAX_PRICE = 0.04 // $0.04
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
      fees: 0.05,
      decimals: 6
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
      fees: 0.05,
      decimals: 6
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
      fees: 0.3,
      decimals: 18
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
      fees: 0.3,
      decimals: 18
    }
  }

  // Bonding Curve Calculation
  const calculateBondingCurvePrice = (circulatingSupply: number): number => {
    // Linear bonding curve from $0.02 to $0.04
    const progress = circulatingSupply / TOTAL_EPO_SUPPLY
    return MIN_PRICE + (MAX_PRICE - MIN_PRICE) * progress
  }

  // Calculate tokens for USD amount using bonding curve
  const calculateTokensFromUSD = (usdAmount: number, currentSupply: number): { tokens: number, avgPrice: number, priceImpact: number } => {
    let remainingUSD = usdAmount
    let totalTokens = 0
    let currentSupplyTemp = currentSupply
    const startPrice = calculateBondingCurvePrice(currentSupplyTemp)
    
    // Simulate buying in small increments to calculate average price
    const increment = 1000 // Buy in 1000 token increments for precision
    
    while (remainingUSD > 0 && currentSupplyTemp < TOTAL_EPO_SUPPLY) {
      const currentPrice = calculateBondingCurvePrice(currentSupplyTemp)
      const tokensAtCurrentPrice = Math.min(increment, TOTAL_EPO_SUPPLY - currentSupplyTemp)
      const costAtCurrentPrice = tokensAtCurrentPrice * currentPrice
      
      if (costAtCurrentPrice <= remainingUSD) {
        totalTokens += tokensAtCurrentPrice
        remainingUSD -= costAtCurrentPrice
        currentSupplyTemp += tokensAtCurrentPrice
      } else {
        // Buy partial amount at current price
        const partialTokens = remainingUSD / currentPrice
        totalTokens += partialTokens
        currentSupplyTemp += partialTokens
        remainingUSD = 0
      }
    }
    
    const avgPrice = totalTokens > 0 ? usdAmount / totalTokens : startPrice
    const endPrice = calculateBondingCurvePrice(currentSupplyTemp)
    const priceImpact = totalTokens > 0 ? ((endPrice - startPrice) / startPrice) * 100 : 0
    
    return { tokens: totalTokens, avgPrice, priceImpact }
  }

  // Calculate USD for token amount using bonding curve
  const calculateUSDFromTokens = (tokenAmount: number, currentSupply: number): { usd: number, avgPrice: number, priceImpact: number } => {
    let remainingTokens = tokenAmount
    let totalUSD = 0
    let currentSupplyTemp = currentSupply
    const startPrice = calculateBondingCurvePrice(currentSupplyTemp)
    
    // Simulate selling in small increments
    const increment = 1000
    
    while (remainingTokens > 0 && currentSupplyTemp > 0) {
      const currentPrice = calculateBondingCurvePrice(currentSupplyTemp)
      const tokensAtCurrentPrice = Math.min(increment, remainingTokens, currentSupplyTemp)
      const valueAtCurrentPrice = tokensAtCurrentPrice * currentPrice
      
      totalUSD += valueAtCurrentPrice
      remainingTokens -= tokensAtCurrentPrice
      currentSupplyTemp -= tokensAtCurrentPrice
    }
    
    const avgPrice = tokenAmount > 0 ? totalUSD / tokenAmount : startPrice
    const endPrice = calculateBondingCurvePrice(currentSupplyTemp)
    const priceImpact = tokenAmount > 0 ? ((startPrice - endPrice) / startPrice) * 100 : 0
    
    return { usd: totalUSD, avgPrice, priceImpact }
  }

  // Update bonding curve data
  useEffect(() => {
    const currentPrice = calculateBondingCurvePrice(totalSold)
    const nextPrice = calculateBondingCurvePrice(totalSold + 1000) // Price after buying 1000 tokens
    const marketCap = totalSold * currentPrice
    
    setBondingCurve({
      currentPrice,
      nextPrice,
      priceImpact: 0,
      totalSupply: TOTAL_EPO_SUPPLY,
      circulatingSupply: totalSold,
      marketCap,
      liquidityPool: 2000000 + marketCap * 0.1 // 10% of market cap added to liquidity
    })
  }, [totalSold])

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
    const sold = transactions.reduce((sum, tx) => {
      if (tx.type === 'buy') return sum + tx.bakAmount
      if (tx.type === 'sell') return sum - tx.bakAmount
      return sum
    }, 0)
    setTotalSold(Math.max(0, sold))
  }, [transactions])

  // Check if EPO can be extended
  const canExtendEPO = (): boolean => {
    return timeRemaining !== null && timeRemaining <= 0 && totalSold < TOTAL_EPO_SUPPLY
  }

  // Handle wallet connection changes
  const handleConnectionChange = (connected: boolean, walletAddress?: string, correctNetwork?: boolean) => {
    setIsConnected(connected)
    setAddress(walletAddress || '')
    setIsCorrectNetwork(correctNetwork || false)
  }

  // Calculate BAK tokens and price impact using bonding curve
  useEffect(() => {
    if (purchaseAmount && !isNaN(parseFloat(purchaseAmount))) {
      const selectedTokenData = supportedTokens[selectedToken]
      const tokenAmount = parseFloat(purchaseAmount)
      const usdValue = tokenAmount * selectedTokenData.price
      
      if (tradeMode === 'buy') {
        const result = calculateTokensFromUSD(usdValue, totalSold)
        setBakAmount(result.tokens.toFixed(2))
        setPriceImpact(result.priceImpact)
      } else {
        // For sell mode, purchaseAmount is BAK tokens
        const result = calculateUSDFromTokens(tokenAmount, totalSold)
        setBakAmount((result.usd / selectedTokenData.price).toFixed(6))
        setPriceImpact(result.priceImpact)
      }
    } else {
      setBakAmount('')
      setPriceImpact(0)
    }
  }, [purchaseAmount, selectedToken, totalSold, tradeMode])

  // Enhanced Purchase/Sell Function
  const executeTrade = async (): Promise<void> => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!purchaseAmount || parseFloat(purchaseAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (timeRemaining !== null && timeRemaining <= 0 && !canExtendEPO()) {
      toast.error('EPO has ended and cannot be extended')
      return
    }

    if (priceImpact > 10) {
      const confirmed = window.confirm(
        `High price impact detected (${priceImpact.toFixed(2)}%). Do you want to continue?`
      )
      if (!confirmed) return
    }

    setIsProcessing(true)

    try {
      const selectedTokenData = supportedTokens[selectedToken]
      const inputAmount = parseFloat(purchaseAmount)
      
      let transaction: any = {
        id: Date.now().toString(),
        from: address,
        tokenUsed: selectedToken,
        type: tradeMode,
        priceImpact: priceImpact,
        slippage: slippage,
        timestamp: new Date().toISOString(),
        status: 'completed',
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        gasUsed: Math.floor(Math.random() * 50000) + 150000,
        gasPrice: Math.floor(Math.random() * 20) + 20
      }

      if (tradeMode === 'buy') {
        const usdValue = inputAmount * selectedTokenData.price
        const result = calculateTokensFromUSD(usdValue, totalSold)
        
        if (totalSold + result.tokens > TOTAL_EPO_SUPPLY) {
          const maxPossible = TOTAL_EPO_SUPPLY - totalSold
          const confirmed = window.confirm(
            `Only ${maxPossible.toFixed(2)} BAK tokens remaining. Purchase ${maxPossible.toFixed(2)} BAK instead?`
          )
          if (!confirmed) {
            setIsProcessing(false)
            return
          }
          result.tokens = maxPossible
        }

        transaction = {
          ...transaction,
          tokenAmount: inputAmount,
          usdValue: usdValue,
          bakAmount: result.tokens,
          avgPrice: result.avgPrice,
          fees: (usdValue * selectedTokenData.fees) / 100
        }
      } else {
        // Sell mode
        const result = calculateUSDFromTokens(inputAmount, totalSold)
        const tokenAmountOut = result.usd / selectedTokenData.price
        
        transaction = {
          ...transaction,
          tokenAmount: tokenAmountOut,
          usdValue: result.usd,
          bakAmount: inputAmount,
          avgPrice: result.avgPrice,
          fees: (result.usd * selectedTokenData.fees) / 100
        }
      }
      
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const updatedTransactions = [...transactions, transaction]
      setTransactions(updatedTransactions)
      localStorage.setItem('epoTransactions', JSON.stringify(updatedTransactions))

      toast.success(
        `Successfully ${tradeMode === 'buy' ? 'purchased' : 'sold'} ${Math.abs(transaction.bakAmount).toFixed(2)} BAK tokens!\nAvg Price: $${transaction.avgPrice.toFixed(4)}\nPrice Impact: ${priceImpact.toFixed(3)}%`
      )
      
      // Reset form
      setPurchaseAmount('')
      setBakAmount('')
      setPriceImpact(0)

    } catch (error) {
      console.error('Trade failed:', error)
      toast.error('Trade failed. Please try again.')
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

  const userStats = userTransactions.reduce((stats, tx) => {
    if (tx.type === 'buy') {
      stats.totalBakPurchased += tx.bakAmount
      stats.totalUsdSpent += tx.usdValue
    } else {
      stats.totalBakSold += tx.bakAmount
      stats.totalUsdReceived += tx.usdValue
    }
    stats.totalFeesPaid += tx.fees || 0
    return stats
  }, {
    totalBakPurchased: 0,
    totalBakSold: 0,
    totalUsdSpent: 0,
    totalUsdReceived: 0,
    totalFeesPaid: 0
  })

  const netBakPosition = userStats.totalBakPurchased - userStats.totalBakSold
  const netUsdPosition = userStats.totalUsdReceived - userStats.totalUsdSpent

  // Quick Actions Component
  const QuickActionsTab: React.FC = () => {
    const quickActions = [
      { label: '💵 $100', token: 'USDT', amount: '100' },
      { label: '💵 $500', token: 'USDT', amount: '500' },
      { label: '💵 $1K', token: 'USDT', amount: '1000' },
      { label: '💵 $10K', token: 'USDT', amount: '10000' },
      { label: '💵 $100K', token: 'USDT', amount: '100000' },
      { label: '💵 $1M', token: 'USDT', amount: '1000000' }
    ]

    return (
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setQuickActionsOpen(!quickActionsOpen)}
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-3 py-2 rounded-lg shadow-lg transition-all duration-200 mb-2 text-sm font-medium"
        >
          ⚡ Quick Buy {quickActionsOpen ? '▼' : '▶'}
        </button>

        {quickActionsOpen && (
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 text-white rounded-lg shadow-2xl border border-indigo-500 backdrop-blur-sm p-3 min-w-[200px] animate-fade-in">
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="bg-indigo-500 hover:bg-indigo-400 text-white font-medium py-2 px-3 rounded text-xs transition-all duration-200 hover:scale-105"
                  onClick={() => {
                    setTradeMode('buy')
                    setSelectedToken(action.token)
                    setPurchaseAmount(action.amount)
                    toast.success(`Set ${action.amount} ${action.token}`)
                    setQuickActionsOpen(false)
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

  // EPO Progress Display
  const EPOProgressDisplay: React.FC = () => {
    const progressPercentage = (totalSold / TOTAL_EPO_SUPPLY) * 100
    
    return (
      <div className="card-brilliant p-6 mb-6">
        <h3 className="text-2xl font-bold text-center mb-4 text-gray-900">
          ⏰ EPO Time Limit & Progress
        </h3>
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatTimeRemaining(timeRemaining)}
          </div>
          <div className="text-lg text-gray-700">
            {totalSold.toLocaleString()} / {TOTAL_EPO_SUPPLY.toLocaleString()} BAK Sold ({progressPercentage.toFixed(2)}%)
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-6 mb-4">
          <div 
            className="bg-gradient-to-r from-teal-400 to-teal-600 h-6 rounded-full transition-all duration-500 flex items-center justify-center"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          >
            {progressPercentage > 10 && (
              <span className="text-white text-sm font-medium">
                {progressPercentage.toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        {canExtendEPO() && (
          <div className="p-3 bg-blue-100 border border-blue-300 rounded-lg text-center">
            <p className="text-blue-800 font-semibold">
              🔄 EPO can be extended as 100M coins target not reached!
            </p>
          </div>
        )}
      </div>
    )
  }

  // Bonding Curve Display
  const BondingCurveDisplay: React.FC = () => {
    const priceChange = bondingCurve.nextPrice - bondingCurve.currentPrice
    const priceChangePercent = (priceChange / bondingCurve.currentPrice) * 100

    return (
      <div className="card-brilliant p-6 mb-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
          📈 Bonding Curve Pricing
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600">Current Price</div>
            <div className="text-lg font-bold text-green-600">
              ${bondingCurve.currentPrice.toFixed(4)}
            </div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600">Next 1K Price</div>
            <div className="text-lg font-bold text-blue-600 flex items-center justify-center">
              ${bondingCurve.nextPrice.toFixed(4)}
              {priceChange > 0 ? (
                <TrendingUpIcon className="h-4 w-4 ml-1 text-green-500" />
              ) : (
                <TrendingDownIcon className="h-4 w-4 ml-1 text-red-500" />
              )}
            </div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600">Market Cap</div>
            <div className="text-lg font-bold text-purple-600">
              ${bondingCurve.marketCap.toLocaleString()}
            </div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-sm text-gray-600">Liquidity Pool</div>
            <div className="text-lg font-bold text-orange-600">
              ${bondingCurve.liquidityPool.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">📊 Bonding Curve Info:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Price Range: $0.02 - $0.04 (linear curve)</li>
            <li>• Price increases with each purchase</li>
            <li>• Price decreases with each sale</li>
            <li>• Current Progress: {((bondingCurve.currentPrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE) * 100).toFixed(1)}% through curve</li>
            <li>• Remaining to max price: {(TOTAL_EPO_SUPPLY - totalSold).toLocaleString()} BAK</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-deep-black py-8">
      <QuickActionsTab />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 bg-clip-text text-transparent">
            🦄 BrainArk EPO - Enhanced Trading Platform
          </h1>
          <p className="text-xl text-gray-300">
            Advanced trading interface with bonding curve pricing and 100M BAK token supply
          </p>
        </div>

        <EPOProgressDisplay />
        <BondingCurveDisplay />

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
                  <AutoWalletConnection onConnectionChange={handleConnectionChange} />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Trading Dashboard */}
                  <div className="card-brilliant p-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      👛 Trading Dashboard
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Connected:</div>
                        <div className="font-mono text-sm">
                          {address?.slice(0, 6)}...{address?.slice(-4)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">BAK Position:</div>
                        <div className="font-semibold">{netBakPosition.toFixed(2)} BAK</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Net P&L:</div>
                        <div className={`font-semibold ${netUsdPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${netUsdPosition.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Total Fees:</div>
                        <div className="font-semibold">${userStats.totalFeesPaid.toFixed(4)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Trades:</div>
                        <div className="font-semibold">{userTransactions.length}</div>
                      </div>
                    </div>
                  </div>

                  {/* Trade Mode Selection */}
                  <div className="card-brilliant p-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      📊 Trading Mode
                    </h3>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setTradeMode('buy')}
                        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                          tradeMode === 'buy'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        🛒 Buy BAK
                      </button>
                      <button
                        onClick={() => setTradeMode('sell')}
                        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                          tradeMode === 'sell'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        💰 Sell BAK
                      </button>
                    </div>
                  </div>

                  {/* Token Selection */}
                  <div className="card-brilliant p-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      💱 Select {tradeMode === 'buy' ? 'Payment' : 'Receive'} Token
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
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trading Calculator */}
                  <div className="card-brilliant p-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      🧮 Bonding Curve Calculator
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {tradeMode === 'buy' 
                            ? `Amount of ${selectedToken} to spend:` 
                            : 'Amount of BAK to sell:'
                          }
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                            {tradeMode === 'buy' ? supportedTokens[selectedToken].icon : '🪙'}
                          </span>
                          <input
                            type="number"
                            value={purchaseAmount}
                            onChange={(e) => setPurchaseAmount(e.target.value)}
                            placeholder="0.00"
                            min="0"
                            max={tradeMode === 'buy' ? '1000000' : netBakPosition.toString()}
                            step={tradeMode === 'buy' ? (selectedToken === 'USDT' || selectedToken === 'USDC' ? '0.01' : '0.001') : '0.01'}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:ring-teal-500 focus:border-teal-500"
                          />
                          <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md">
                            {tradeMode === 'buy' ? selectedToken : 'BAK'}
                          </span>
                        </div>
                        {tradeMode === 'buy' && (
                          <div className="text-xs text-gray-500 mt-1">
                            Range: $1 - $1,000,000
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl text-teal-500">
                          {tradeMode === 'buy' ? '→' : '←'}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {tradeMode === 'buy' 
                            ? 'BAK tokens you will receive:' 
                            : `${selectedToken} you will receive:`
                          }
                        </label>
                        <div className={`flex items-center gap-2 p-3 rounded-lg border-2 ${
                          tradeMode === 'buy' 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-blue-50 border-blue-200'
                        }`}>
                          <span className="text-xl">
                            {tradeMode === 'buy' ? '🪙' : supportedTokens[selectedToken].icon}
                          </span>
                          <span className={`text-xl font-bold ${
                            tradeMode === 'buy' ? 'text-green-600' : 'text-blue-600'
                          }`}>
                            {bakAmount || '0.00'}
                          </span>
                          <span className="text-gray-600">
                            {tradeMode === 'buy' ? 'BAK' : selectedToken}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price Impact Warning */}
                    {priceImpact > 0 && (
                      <div className={`p-3 rounded-lg mb-4 ${
                        priceImpact > 5 ? 'bg-red-50 border border-red-200' :
                        priceImpact > 2 ? 'bg-yellow-50 border border-yellow-200' :
                        'bg-green-50 border border-green-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span>📈 Price Impact: </span>
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
                          {tradeMode === 'buy' ? (
                            <>
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
                                <span>Avg Price:</span>
                                <span>${bakAmount ? ((parseFloat(purchaseAmount || '0') * supportedTokens[selectedToken].price) / parseFloat(bakAmount)).toFixed(4) : '0.0000'}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between">
                                <span>BAK Input:</span>
                                <span>{purchaseAmount} BAK</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{selectedToken} Output:</span>
                                <span>{bakAmount} {selectedToken}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>USD Value:</span>
                                <span>${(parseFloat(bakAmount || '0') * supportedTokens[selectedToken].price).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Avg Price:</span>
                                <span>${purchaseAmount ? ((parseFloat(bakAmount || '0') * supportedTokens[selectedToken].price) / parseFloat(purchaseAmount)).toFixed(4) : '0.0000'}</span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between">
                            <span>Trading Fee:</span>
                            <span>${((parseFloat(bakAmount || '0') * supportedTokens[selectedToken].price * supportedTokens[selectedToken].fees) / 100).toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Price Impact:</span>
                            <span>{priceImpact.toFixed(3)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Current BAK Price:</span>
                            <span>${bondingCurve.currentPrice.toFixed(4)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Trade Button */}
                    <button
                      onClick={executeTrade}
                      disabled={
                        !purchaseAmount || 
                        parseFloat(purchaseAmount) <= 0 || 
                        isProcessing || 
                        (timeRemaining !== null && timeRemaining <= 0 && !canExtendEPO()) || 
                        (tradeMode === 'buy' && totalSold >= TOTAL_EPO_SUPPLY) ||
                        (tradeMode === 'sell' && parseFloat(purchaseAmount) > netBakPosition)
                      }
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                        isProcessing ? 'btn-warning' :
                        (timeRemaining !== null && timeRemaining <= 0 && !canExtendEPO()) ? 'bg-gray-400 text-gray-700 cursor-not-allowed' :
                        (tradeMode === 'buy' && totalSold >= TOTAL_EPO_SUPPLY) ? 'bg-gray-400 text-gray-700 cursor-not-allowed' :
                        (tradeMode === 'sell' && parseFloat(purchaseAmount) > netBakPosition) ? 'bg-gray-400 text-gray-700 cursor-not-allowed' :
                        priceImpact > 5 ? 'btn-warning' :
                        tradeMode === 'buy' ? 'btn-success' : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      {isProcessing ? '⏳ Processing Transaction...' : 
                       (timeRemaining !== null && timeRemaining <= 0 && !canExtendEPO()) ? '⏰ EPO Ended' :
                       (tradeMode === 'buy' && totalSold >= TOTAL_EPO_SUPPLY) ? '🔒 All Tokens Sold' :
                       (tradeMode === 'sell' && parseFloat(purchaseAmount) > netBakPosition) ? '❌ Insufficient BAK Balance' :
                       priceImpact > 5 ? `⚠️ ${tradeMode === 'buy' ? 'Buy' : 'Sell'} Anyway (${priceImpact.toFixed(2)}% impact)` :
                       tradeMode === 'buy' ? `🛒 Buy ${bakAmount || '0'} BAK` : `💰 Sell ${purchaseAmount || '0'} BAK`}
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
                  <div className="text-sm text-gray-400">Current BAK Price</div>
                  <div className="font-semibold text-white">${bondingCurve.currentPrice.toFixed(4)}</div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-400">Price Range</div>
                  <div className="font-semibold text-white">$0.02 - $0.04</div>
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
                  <li>• Bonding curve pricing ($0.02-$0.04)</li>
                  <li>• Buy & sell functionality</li>
                  <li>• Multiple payment tokens supported</li>
                  <li>• Real-time price impact calculation</li>
                  <li>• Advanced slippage protection</li>
                  <li>• Quick action buttons ($1-$1M)</li>
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
              {userTransactions.slice(-10).reverse().map((tx) => (
                <div key={tx.id} className="card-brilliant p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className={`font-semibold text-lg ${tx.type === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'buy' ? '🛒 BUY' : '💰 SELL'} {Math.abs(tx.bakAmount).toFixed(2)} BAK
                      </div>
                      <div className="text-gray-600">
                        {tx.type === 'buy' 
                          ? `${tx.tokenAmount.toFixed(4)} ${tx.tokenUsed} → ${tx.bakAmount.toFixed(2)} BAK`
                          : `${tx.bakAmount.toFixed(2)} BAK → ${tx.tokenAmount.toFixed(4)} ${tx.tokenUsed}`
                        }
                      </div>
                      <div className="text-sm text-gray-500">
                        Avg Price: ${tx.avgPrice.toFixed(4)} | USD Value: ${tx.usdValue.toFixed(2)}
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
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600">BAK Position:</div>
                  <div className="font-semibold text-green-600">{netBakPosition.toFixed(2)} BAK</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Bought:</div>
                  <div className="font-semibold">{userStats.totalBakPurchased.toFixed(2)} BAK</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Sold:</div>
                  <div className="font-semibold">{userStats.totalBakSold.toFixed(2)} BAK</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Net P&L:</div>
                  <div className={`font-semibold ${netUsdPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${netUsdPosition.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Fees:</div>
                  <div className="font-semibold">${userStats.totalFeesPaid.toFixed(4)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedEPOWithBondingCurve