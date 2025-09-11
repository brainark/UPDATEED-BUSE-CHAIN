import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { toast } from 'react-hot-toast'
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ArrowsRightLeftIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  CogIcon,
  ShoppingCartIcon,
  BanknotesIcon,
  ArrowRightIcon,
  ExternalLinkIcon,
  LockClosedIcon,
  LockOpenIcon,
  WalletIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { PAYMENT_OPTIONS, getPaymentOptionsByNetwork, switchToNetwork, calculateBAKAmount, calculateUSDValue, startTokenPriceUpdates, getTokenPrice } from '@/utils/multiNetworkConfig'
import { liquidityTracker } from '@/utils/liquidityTracker'
import AutoWalletConnection from './AutoWalletConnection'

interface PriceData {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
}

interface TradeData {
  time: string
  price: number
  amount: number
  type: 'buy' | 'sell'
}

interface NetworkOption {
  chainId: number
  name: string
  icon: string
  color: string
}

interface LiquidityStatus {
  canSell: boolean
  totalLiquidity: string
  remainingToUnlock: string
  progressPercentage: number
  timeEstimate: string
}

const AdvancedTradingPanel: React.FC = () => {
  // Wallet connection
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  
  // Trading state
  const [selectedNetwork, setSelectedNetwork] = useState<string>('ethereum')
  const [selectedToken, setSelectedToken] = useState<string>('USDT')
  const [paymentAmount, setPaymentAmount] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false)
  
  // Liquidity tracking
  const [liquidityStatus, setLiquidityStatus] = useState<LiquidityStatus>({
    canSell: false,
    totalLiquidity: '$0.00',
    remainingToUnlock: '$1,000,000',
    progressPercentage: 0,
    timeEstimate: 'Loading...'
  })

  const [priceData, setPriceData] = useState<PriceData>({
    symbol: 'BAK',
    price: 0.02,
    change24h: 0,
    volume24h: 50000,
    marketCap: 2000000
  })

  const [recentTrades, setRecentTrades] = useState<TradeData[]>([
    { time: '14:32:15', price: 0.02, amount: 1000, type: 'buy' },
    { time: '14:31:42', price: 0.02, amount: 500, type: 'sell' },
    { time: '14:30:18', price: 0.02, amount: 2500, type: 'buy' },
    { time: '14:29:55', price: 0.02, amount: 750, type: 'buy' },
    { time: '14:28:33', price: 0.02, amount: 1200, type: 'sell' },
  ])

  // Network options
  const networkOptions: NetworkOption[] = [
    { chainId: 1, name: 'Ethereum', icon: '💎', color: 'text-blue-500' },
    { chainId: 56, name: 'BSC', icon: '🟡', color: 'text-yellow-500' },
    { chainId: 137, name: 'Polygon', icon: '🟣', color: 'text-purple-500' },
  ]

  // Available payment tokens for selected network
  const availableTokens = useMemo(() => {
    return getPaymentOptionsByNetwork(selectedNetwork)
  }, [selectedNetwork])

  // Calculate expected BAK amount
  const expectedBAK = useMemo(() => {
    if (!paymentAmount || isNaN(parseFloat(paymentAmount))) return '0'
    return calculateBAKAmount(parseFloat(paymentAmount), selectedToken).toFixed(2)
  }, [paymentAmount, selectedToken])

  // Calculate USD value
  const usdValue = useMemo(() => {
    if (!paymentAmount || isNaN(parseFloat(paymentAmount))) return 0
    return calculateUSDValue(parseFloat(paymentAmount), selectedToken)
  }, [paymentAmount, selectedToken])

  // Initialize token prices
  useEffect(() => {
    startTokenPriceUpdates()
  }, [])

  // Load liquidity status
  const loadLiquidityStatus = useCallback(async () => {
    try {
      const status = await liquidityTracker.getLiquidityStatus()
      setLiquidityStatus(status)
    } catch (error) {
      console.error('Error loading liquidity status:', error)
    }
  }, [])

  useEffect(() => {
    loadLiquidityStatus()
    // Refresh every 30 seconds
    const interval = setInterval(loadLiquidityStatus, 30000)
    return () => clearInterval(interval)
  }, [loadLiquidityStatus])

  // Price updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Small random price fluctuations around $0.02
      const randomChange = (Math.random() - 0.5) * 0.0001
      const newPrice = Math.max(0.019, Math.min(0.021, priceData.price + randomChange))
      
      setPriceData(prev => ({
        ...prev,
        price: newPrice,
        change24h: ((newPrice - 0.02) / 0.02) * 100
      }))

      // Add new random trade
      if (Math.random() > 0.7) {
        const newTrade: TradeData = {
          time: new Date().toLocaleTimeString(),
          price: newPrice,
          amount: Math.floor(Math.random() * 5000) + 100,
          type: Math.random() > 0.5 ? 'buy' : 'sell'
        }
        
        setRecentTrades(prev => [newTrade, ...prev.slice(0, 9)])
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [priceData.price])

  // Handle network switch
  const handleNetworkSwitch = async (networkName: string) => {
    setSelectedNetwork(networkName)
    const paymentOption = getPaymentOptionsByNetwork(networkName)[0]
    if (paymentOption && switchChain) {
      try {
        await switchChain({ chainId: paymentOption.network.chainId })
        toast.success(`Switched to ${paymentOption.network.name}`)
      } catch (error) {
        console.error('Network switch failed:', error)
        toast.error('Failed to switch network')
      }
    }
  }

  // Handle buy transaction
  const handleBuy = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setIsProcessing(true)
    try {
      toast.loading('Processing cross-chain purchase...')
      // Implementation would integrate with cross-chain purchase logic
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulated delay
      toast.success(`Successfully purchased ${expectedBAK} BAK tokens!`)
      setPaymentAmount('')
    } catch (error) {
      toast.error('Purchase failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatPrice = (price: number) => price.toFixed(4)
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toLocaleString()
  }
  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(num)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Enhanced Trading Dashboard Header */}
      <div className="card bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <GlobeAltIcon className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                🌐 Advanced Trading Dashboard
              </h3>
              <p className="text-sm text-gray-600">Cross-chain BAK trading interface</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
            <button
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <CogIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Wallet Connection */}
        {!isConnected && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <WalletIcon className="h-5 w-5 text-yellow-600" />
              <p className="text-yellow-800 font-medium">Connect your wallet to start trading</p>
            </div>
            <AutoWalletConnection onConnectionChange={(connected) => {}} />
          </div>
        )}

        {/* Liquidity Lock Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-white rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              {liquidityStatus.canSell ? <LockOpenIcon className="h-5 w-5 text-green-500" /> : <LockClosedIcon className="h-5 w-5 text-red-500" />}
              <span className="font-semibold">Trading Status</span>
            </div>
            <p className={`text-sm ${liquidityStatus.canSell ? 'text-green-600' : 'text-red-600'}`}>
              {liquidityStatus.canSell ? 'Buy & Sell Available' : 'Buy Only (Sell Locked)'}
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg border">
            <div className="font-semibold mb-1">Total Liquidity</div>
            <div className="text-lg font-bold text-emerald-600">{liquidityStatus.totalLiquidity}</div>
            <div className="text-sm text-gray-600">{liquidityStatus.progressPercentage.toFixed(1)}% of $1M target</div>
          </div>
          <div className="p-4 bg-white rounded-lg border">
            <div className="font-semibold mb-1">Unlock Estimate</div>
            <div className="text-lg font-bold text-blue-600">{liquidityStatus.timeEstimate}</div>
            <div className="text-sm text-gray-600">Until sell unlock</div>
          </div>
        </div>
      </div>

      {/* Cross-Chain Trading Interface */}
      {isConnected && (
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingCartIcon className="h-6 w-6 text-emerald-600" />
            <h3 className="text-xl font-bold text-gray-900">Cross-Chain BAK Purchase</h3>
          </div>

          {/* Network Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              🌐 Select Payment Network
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {networkOptions.map((network) => (
                <button
                  key={network.chainId}
                  onClick={() => handleNetworkSwitch(network.name.toLowerCase())}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedNetwork === network.name.toLowerCase()
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{network.icon}</div>
                    <div className="font-semibold text-gray-900">{network.name}</div>
                    <div className={`text-sm ${network.color}`}>Chain: {network.chainId}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Token Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              💱 Select Payment Token
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableTokens.map((option) => {
                const tokenPrice = getTokenPrice(option.token.symbol)
                return (
                  <button
                    key={`${option.token.symbol}-${option.network.name}`}
                    onClick={() => setSelectedToken(option.token.symbol)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      selectedToken === option.token.symbol
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{option.token.icon}</div>
                      <div className="font-semibold text-gray-900">{option.token.symbol}</div>
                      <div className="text-sm text-gray-600">${tokenPrice.toFixed(2)}</div>
                      {option.isNative && (
                        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1">
                          Native
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Trading Calculator */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pay with {selectedToken}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  step="any"
                  min="0"
                />
                <div className="absolute right-3 top-3 text-gray-500 font-medium">
                  {selectedToken}
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                ≈ ${usdValue.toFixed(2)} USD
              </div>
            </div>
            
            <div className="text-center">
              <ArrowRightIcon className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Cross-Chain</div>
              <div className="text-xs text-emerald-600 font-medium">Auto Bridge</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                You receive BAK
              </label>
              <div className="p-3 bg-emerald-50 border-2 border-emerald-200 rounded-lg">
                <div className="text-2xl font-bold text-emerald-700">
                  {expectedBAK}
                </div>
                <div className="text-sm text-emerald-600">
                  BAK Tokens
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Rate: $0.02 per BAK
              </div>
            </div>
          </div>

          {/* Buy Button */}
          <button
            onClick={handleBuy}
            disabled={isProcessing || !paymentAmount || parseFloat(paymentAmount) <= 0}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
              isProcessing 
                ? 'bg-yellow-500 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing Cross-Chain Purchase...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <BanknotesIcon className="h-6 w-6" />
                Buy {expectedBAK} BAK for {paymentAmount || '0'} {selectedToken}
              </div>
            )}
          </button>

          {showAdvancedSettings && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3">⚙️ Advanced Settings</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-800">Slippage Tolerance:</span>
                  <span className="font-medium text-blue-900">0.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800">Bridge Fee:</span>
                  <span className="font-medium text-blue-900">~$2-5 USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800">Estimated Time:</span>
                  <span className="font-medium text-blue-900">2-5 minutes</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Price Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            BAK/USD Live Price
          </h3>
          <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(priceData.price)}
            </span>
            <div className={`flex items-center text-xs sm:text-sm ${
              priceData.change24h >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {priceData.change24h >= 0 ? (
                <ArrowTrendingUpIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              )}
              {Math.abs(priceData.change24h).toFixed(2)}%
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400 block">24h Volume</span>
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(priceData.volume24h)}
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 block">Market Cap</span>
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(priceData.marketCap)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="card">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">
          Recent Trades
        </h3>
        
        <div className="space-y-1 sm:space-y-2 overflow-x-auto">
          <div className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-3 min-w-[250px] px-1">
            <span>Time</span>
            <span className="text-right">Price</span>
            <span className="text-right">Amount</span>
          </div>
          
          {recentTrades.map((trade, index) => (
            <div key={index} className="grid grid-cols-3 text-xs sm:text-sm min-w-[250px] px-1 py-0.5">
              <span className="text-gray-600 dark:text-gray-300 font-mono text-xs truncate">
                {trade.time}
              </span>
              <span className={`text-right font-mono text-xs truncate ${
                trade.type === 'buy' ? 'text-green-500' : 'text-red-500'
              }`}>
                {formatPrice(trade.price)}
              </span>
              <span className="text-right text-gray-600 dark:text-gray-300 font-mono text-xs truncate">
                {formatNumber(trade.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Network Support Info */}
      <div className="card">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">
          🌐 Multi-Network Support
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💎</span>
                <span className="font-semibold text-gray-900">Ethereum</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• ETH (Native)</div>
                <div>• USDT, USDC</div>
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🟡</span>
                <span className="font-semibold text-gray-900">BSC</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• BNB (Native)</div>
                <div>• USDT, USDC</div>
              </div>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🟣</span>
                <span className="font-semibold text-gray-900">Polygon</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• MATIC (Native)</div>
                <div>• USDT, USDC</div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">🔄 How Cross-Chain Trading Works:</h4>
            <ol className="text-sm text-green-800 space-y-1">
              <li>1. Select your preferred network and token</li>
              <li>2. Make payment to BrainArk treasury wallet</li>
              <li>3. Oracle system verifies your payment</li>
              <li>4. BAK tokens delivered to your wallet on BrainArk network</li>
              <li>5. Start using BAK immediately!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdvancedTradingPanel