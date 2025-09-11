// High-Performance EPO Trading Component for Thousands of Simultaneous Users
import React, { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { EPO_CONFIG } from '@/utils/config'
import AutoWalletConnection from './AutoWalletConnection'
import { LockClosedIcon, LockOpenIcon, RefreshIcon } from '@heroicons/react/24/outline'
import { EPOShaderBackground } from './shaders'
import { useOptimizedEPOContract } from '@/hooks/useOptimizedEPOContract'
import { optimizedLiquidityTracker, checkSellPermission } from '@/utils/optimizedLiquidityTracker'
import { startTokenPriceUpdates } from '@/utils/multiNetworkConfig'

// Memoized components for better performance
const MemoizedProgressBar = memo<{ percentage: number; className?: string }>(({ percentage, className }) => (
  <div className={`w-full bg-gray-200 rounded-full h-6 ${className}`}>
    <div 
      className="bg-gradient-to-r from-emerald-400 to-green-600 h-6 rounded-full transition-all duration-500 flex items-center justify-center"
      style={{ width: `${Math.min(percentage, 100)}%` }}
    >
      {percentage > 10 && (
        <span className="text-white text-sm font-medium">
          {percentage.toFixed(1)}%
        </span>
      )}
    </div>
  </div>
))

const MemoizedStatCard = memo<{ title: string; value: string; loading?: boolean; color?: string }>(({ title, value, loading, color = 'text-gray-900' }) => (
  <div className="text-center p-3 bg-gray-800 rounded-lg">
    <div className="text-sm text-gray-400">{title}</div>
    <div className={`font-semibold ${color}`}>
      {loading ? 'Loading...' : value}
    </div>
  </div>
))

// Optimized token selection with memoization
const TokenSelector = memo<{
  selectedToken: string
  onTokenSelect: (token: string) => void
  tradeMode: 'buy' | 'sell'
}>(({ selectedToken, onTokenSelect, tradeMode }) => {
  const supportedTokens = useMemo(() => ({
    USDT: { symbol: 'USDT', name: 'Tether USD', icon: '💵', price: 1.00, change24h: 0.01, color: '#26a17b' },
    USDC: { symbol: 'USDC', name: 'USD Coin', icon: '💰', price: 1.00, change24h: -0.02, color: '#2775ca' },
    BNB: { symbol: 'BNB', name: 'Binance Coin', icon: '🟡', price: 635.50, change24h: 2.45, color: '#f3ba2f' },
    ETH: { symbol: 'ETH', name: 'Ethereum', icon: '💎', price: 3420.75, change24h: 1.85, color: '#627eea' }
  }), [])

  return (
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
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onTokenSelect(key)}
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
  )
})

// Main component with performance optimizations
const HighPerformanceEPOTrading: React.FC = () => {
  // State management with optimized updates
  const [address, setAddress] = useState<string>('')
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false)
  const [selectedToken, setSelectedToken] = useState<string>('USDT')
  const [purchaseAmount, setPurchaseAmount] = useState<string>('')
  const [bakAmount, setBakAmount] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy')
  const [quickActionsOpen, setQuickActionsOpen] = useState<boolean>(false)
  
  // Optimized contract and liquidity data
  const { stats: epoStats, isLoading: epoLoading, error: epoError, refetch: refetchEPO, purchaseBAK } = useOptimizedEPOContract()
  
  // Liquidity status with optimized caching
  const [liquidityStatus, setLiquidityStatus] = useState({
    canSell: false,
    totalLiquidity: '$0',
    remainingToUnlock: '$1,000,000',
    progressPercentage: 0,
    timeEstimate: 'Loading...'
  })
  const [liquidityLoading, setLiquidityLoading] = useState(true)

  // Refs for performance optimization
  const lastLiquidityFetch = useRef(0)
  const liquidityFetchInterval = useRef<NodeJS.Timeout>()

  // Memoized calculations
  const contractData = useMemo(() => {
    if (!epoStats) return { totalSold: 0, currentPrice: 0.02, remainingSupply: 100000000, totalRaised: 0, contractBalance: 0 }
    return {
      totalSold: parseFloat(epoStats.totalSold),
      currentPrice: parseFloat(epoStats.price),
      remainingSupply: parseFloat(epoStats.remainingSupply),
      totalRaised: parseFloat(epoStats.totalRaised),
      contractBalance: parseFloat(epoStats.contractBalance)
    }
  }, [epoStats])

  const timeRemaining = useMemo(() => {
    const EPO_END_DATE = new Date(EPO_CONFIG.START_DATE.getTime() + (EPO_CONFIG.DURATION_DAYS * 24 * 60 * 60 * 1000))
    const remaining = EPO_END_DATE.getTime() - Date.now()
    return remaining > 0 ? remaining : 0
  }, [])

  const formatTimeRemaining = useCallback((milliseconds: number): string => {
    if (milliseconds <= 0) return 'EPO Ended'
    
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24))
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`
  }, [])

  // Optimized BAK calculation
  const calculatedBAKAmount = useMemo(() => {
    if (!purchaseAmount || !contractData.currentPrice || isNaN(parseFloat(purchaseAmount))) {
      return ''
    }

    const inputAmount = parseFloat(purchaseAmount)
    if (tradeMode === 'buy') {
      const bakTokens = inputAmount / contractData.currentPrice
      return bakTokens.toFixed(2)
    } else {
      return (inputAmount * 0.015).toFixed(6) // Fixed sell price
    }
  }, [purchaseAmount, contractData.currentPrice, tradeMode])

  // Update BAK amount when calculation changes
  useEffect(() => {
    setBakAmount(calculatedBAKAmount)
  }, [calculatedBAKAmount])

  // Initialize token price updates once
  useEffect(() => {
    startTokenPriceUpdates()
  }, [])

  // Optimized liquidity status loading
  const loadLiquidityStatus = useCallback(async (force = false) => {
    const now = Date.now()
    if (!force && (now - lastLiquidityFetch.current) < 30000) return // 30 second throttle

    lastLiquidityFetch.current = now
    setLiquidityLoading(true)
    
    try {
      const status = await optimizedLiquidityTracker.getLiquidityStatus()
      setLiquidityStatus(status)
    } catch (error) {
      console.error('Error loading liquidity status:', error)
    } finally {
      setLiquidityLoading(false)
    }
  }, [])

  // Setup liquidity status updates with optimized intervals
  useEffect(() => {
    loadLiquidityStatus(true)
    
    // Longer interval for better performance
    liquidityFetchInterval.current = setInterval(() => {
      loadLiquidityStatus()
    }, 2 * 60 * 1000) // 2 minutes

    return () => {
      if (liquidityFetchInterval.current) {
        clearInterval(liquidityFetchInterval.current)
      }
    }
  }, [loadLiquidityStatus])

  // Optimized trade execution
  const executeTrade = useCallback(async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!purchaseAmount || parseFloat(purchaseAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (timeRemaining <= 0) {
      toast.error('EPO has ended')
      return
    }

    if (contractData.remainingSupply <= 0) {
      toast.error('All BAK tokens have been sold')
      return
    }

    setIsProcessing(true)

    try {
      const inputAmount = parseFloat(purchaseAmount)
      
      if (tradeMode === 'buy') {
        // Convert to wei for contract call
        const ethAmount = inputAmount / 3420.75 // Rough ETH conversion
        const weiAmount = (ethAmount * 1e18).toString()
        
        const txHash = await purchaseBAK(weiAmount)
        
        toast.success(
          `Transaction submitted! Hash: ${txHash.slice(0, 10)}...`,
          { duration: 5000 }
        )
        
        // Reset form
        setPurchaseAmount('')
        setBakAmount('')
        
      } else {
        const sellPermission = await checkSellPermission()
        if (!sellPermission) {
          toast.error(`Selling locked until $1M liquidity. Current: ${liquidityStatus.totalLiquidity}`)
          return
        }
        
        toast.error('Selling functionality coming soon')
      }

    } catch (error: any) {
      console.error('Trade failed:', error)
      toast.error(`Transaction failed: ${error.message || 'Please try again'}`)
    } finally {
      setIsProcessing(false)
    }
  }, [isConnected, address, purchaseAmount, timeRemaining, contractData.remainingSupply, tradeMode, purchaseBAK, liquidityStatus.totalLiquidity])

  // Memoized wallet connection handler
  const handleConnectionChange = useCallback((connected: boolean, walletAddress?: string, correctNetwork?: boolean) => {
    setIsConnected(connected)
    setAddress(walletAddress || '')
    setIsCorrectNetwork(correctNetwork || false)
  }, [])

  // Quick action handlers
  const handleQuickAction = useCallback((amount: string) => {
    setTradeMode('buy')
    setSelectedToken('USDT')
    setPurchaseAmount(amount)
    toast.success(`Set ${amount} USDT`)
    setQuickActionsOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-deep-black py-8 relative">
      <EPOShaderBackground />
      
      {/* Quick Actions */}
      <div className="fixed top-4 right-2 sm:right-4 z-50">
        <button
          onClick={() => setQuickActionsOpen(!quickActionsOpen)}
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-3 py-2 rounded-lg shadow-lg transition-all duration-200 mb-2 text-sm font-medium"
        >
          ⚡ Quick Buy {quickActionsOpen ? '▼' : '▶'}
        </button>

        {quickActionsOpen && (
          <div className="bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800 text-white rounded-lg shadow-2xl border border-emerald-500 backdrop-blur-sm p-3 min-w-[200px]">
            <div className="grid grid-cols-2 gap-2">
              {['100', '500', '1000', '10000', '100000', '1000000'].map((amount) => (
                <button
                  key={amount}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-medium py-2 px-3 rounded text-xs transition-all duration-200 hover:scale-105"
                  onClick={() => handleQuickAction(amount)}
                >
                  💵 ${amount}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-500 via-green-600 to-teal-700 bg-clip-text text-transparent">
            ⚡ High-Performance EPO Trading
          </h1>
          <p className="text-xl text-gray-300">
            Optimized for thousands of simultaneous users
          </p>
        </div>

        {/* EPO Progress */}
        <div className="card-brilliant p-6 mb-6">
          <h3 className="text-2xl font-bold text-center mb-4 text-gray-900">
            ⏰ EPO Progress & Status
          </h3>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatTimeRemaining(timeRemaining)}
            </div>
            <div className="text-lg text-gray-700">
              {epoLoading ? 'Loading contract data...' : (
                `${contractData.totalSold.toLocaleString()} / ${EPO_CONFIG.TOTAL_SUPPLY.toLocaleString()} BAK Sold (${((contractData.totalSold / EPO_CONFIG.TOTAL_SUPPLY) * 100).toFixed(2)}%)`
              )}
            </div>
            {epoError && (
              <div className="text-sm text-red-600 mt-2">
                Contract Error: {epoError}
              </div>
            )}
          </div>
          
          <MemoizedProgressBar 
            percentage={(contractData.totalSold / EPO_CONFIG.TOTAL_SUPPLY) * 100}
            className="mb-4"
          />
        </div>

        {/* Liquidity Status */}
        <div className="card-brilliant p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            {liquidityStatus.canSell ? (
              <LockOpenIcon className="h-8 w-8 text-green-500 mr-3" />
            ) : (
              <LockClosedIcon className="h-8 w-8 text-red-500 mr-3" />
            )}
            <h3 className="text-2xl font-bold text-gray-900">
              🏦 Treasury Liquidity Status
            </h3>
            <button
              onClick={() => loadLiquidityStatus(true)}
              className="ml-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={liquidityLoading}
            >
              <RefreshIcon className={`h-5 w-5 ${liquidityLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {liquidityStatus.totalLiquidity} / $1,000,000
            </div>
            <div className="text-sm text-gray-500">
              Progress: {liquidityStatus.progressPercentage.toFixed(1)}% • ETA: {liquidityStatus.timeEstimate}
            </div>
          </div>
          
          <MemoizedProgressBar 
            percentage={liquidityStatus.progressPercentage}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Trading Section */}
          <div className="lg:col-span-2">
            <div className="card-dark p-6">
              <h2 className="text-2xl font-bold mb-6 text-white">
                🚀 High-Performance Trading
              </h2>
              
              {!isConnected ? (
                <div className="text-center py-12">
                  <p className="text-gray-300 mb-6">Connect wallet to start trading</p>
                  <AutoWalletConnection onConnectionChange={handleConnectionChange} />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Dashboard */}
                  <div className="card-brilliant p-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">📊 Trading Dashboard</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Wallet:</div>
                        <div className="font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Contract Balance:</div>
                        <div className="font-semibold">{epoLoading ? 'Loading...' : `${contractData.contractBalance.toFixed(0)} BAK`}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Current Price:</div>
                        <div className="font-semibold text-green-600">{epoLoading ? 'Loading...' : `$${contractData.currentPrice.toFixed(4)}`}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Status:</div>
                        <div className="font-semibold">{epoLoading ? 'Loading...' : (epoError ? '❌ Error' : '✅ Active')}</div>
                      </div>
                    </div>
                  </div>

                  {/* Trade Mode */}
                  <div className="card-brilliant p-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">🎯 Trading Mode</h3>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setTradeMode('buy')}
                        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                          tradeMode === 'buy' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        🛒 Buy BAK
                      </button>
                      <button
                        onClick={() => setTradeMode('sell')}
                        disabled={!liquidityStatus.canSell}
                        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                          !liquidityStatus.canSell
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : tradeMode === 'sell' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        💰 Sell BAK {!liquidityStatus.canSell && '🔒'}
                      </button>
                    </div>
                  </div>

                  <TokenSelector
                    selectedToken={selectedToken}
                    onTokenSelect={setSelectedToken}
                    tradeMode={tradeMode}
                  />

                  {/* Trading Calculator */}
                  <div className="card-brilliant p-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">⚡ Trade Calculator</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {tradeMode === 'buy' ? `${selectedToken} Amount:` : 'BAK Amount:'}
                        </label>
                        <input
                          type="number"
                          value={purchaseAmount}
                          onChange={(e) => setPurchaseAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      
                      <div className="text-center text-2xl text-emerald-500">
                        {tradeMode === 'buy' ? '→' : '←'}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {tradeMode === 'buy' ? 'BAK You Get:' : `${selectedToken} You Get:`}
                        </label>
                        <div className="p-3 rounded-lg border-2 bg-green-50 border-green-200">
                          <span className="text-xl font-bold text-green-600">
                            {bakAmount || '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={executeTrade}
                      disabled={!purchaseAmount || parseFloat(purchaseAmount) <= 0 || isProcessing || timeRemaining <= 0 || contractData.remainingSupply <= 0}
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                        isProcessing ? 'bg-yellow-500 text-white cursor-not-allowed' :
                        timeRemaining <= 0 ? 'bg-gray-400 text-gray-700 cursor-not-allowed' :
                        contractData.remainingSupply <= 0 ? 'bg-gray-400 text-gray-700 cursor-not-allowed' :
                        'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white'
                      }`}
                    >
                      {isProcessing ? '⏳ Processing...' : 
                       timeRemaining <= 0 ? '⏰ EPO Ended' :
                       contractData.remainingSupply <= 0 ? '🔒 All Sold' :
                       tradeMode === 'buy' ? `🛒 Buy ${bakAmount || '0'} BAK` : `💰 Sell ${purchaseAmount || '0'} BAK`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <div className="card-dark p-6">
              <h2 className="text-xl font-bold mb-4 text-white">📊 Contract Stats</h2>
              <div className="space-y-4">
                <MemoizedStatCard
                  title="Current Price"
                  value={`$${contractData.currentPrice.toFixed(4)}`}
                  loading={epoLoading}
                  color="text-white"
                />
                <MemoizedStatCard
                  title="Tokens Sold"
                  value={`${contractData.totalSold.toFixed(0)} BAK`}
                  loading={epoLoading}
                  color="text-white"
                />
                <MemoizedStatCard
                  title="Total Raised"
                  value={`$${contractData.totalRaised.toFixed(2)}`}
                  loading={epoLoading}
                  color="text-white"
                />
                <MemoizedStatCard
                  title="Remaining"
                  value={`${contractData.remainingSupply.toFixed(0)} BAK`}
                  loading={epoLoading}
                  color="text-white"
                />
              </div>

              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-white mb-3">⚡ Performance Features:</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• ⚡ Optimized for thousands of users</li>
                  <li>• 🔄 Connection pooling & caching</li>
                  <li>• 📊 Real-time contract data</li>
                  <li>• 🚀 Transaction queue management</li>
                  <li>• 💰 Live token price updates</li>
                  <li>• 🎯 Sub-second UI responsiveness</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HighPerformanceEPOTrading