import { useState, useEffect } from 'react'
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'

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

export default function TradingPanel() {
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

  const [orderBook, setOrderBook] = useState({
    bids: [
      { price: 0.0199, amount: 5000 },
      { price: 0.0198, amount: 3000 },
      { price: 0.0197, amount: 2000 },
      { price: 0.0196, amount: 1500 },
      { price: 0.0195, amount: 1000 },
    ],
    asks: [
      { price: 0.0201, amount: 4000 },
      { price: 0.0202, amount: 3500 },
      { price: 0.0203, amount: 2500 },
      { price: 0.0204, amount: 2000 },
      { price: 0.0205, amount: 1500 },
    ]
  })

  useEffect(() => {
    // Simulate real-time price updates
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

  const formatPrice = (price: number) => {
    return price.toFixed(4)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
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
    <div className="space-y-6">
      {/* Price Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            BAK/USD
          </h3>
          <ChartBarIcon className="h-5 w-5 text-gray-500" />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(priceData.price)}
            </span>
            <div className={`flex items-center text-sm ${
              priceData.change24h >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {priceData.change24h >= 0 ? (
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              {Math.abs(priceData.change24h).toFixed(2)}%
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">24h Volume</span>
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(priceData.volume24h)}
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Market Cap</span>
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(priceData.marketCap)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Book */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Order Book
        </h3>
        
        <div className="space-y-4">
          {/* Asks (Sell Orders) */}
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 grid grid-cols-2">
              <span>Price (USD)</span>
              <span className="text-right">Amount (BAK)</span>
            </div>
            <div className="space-y-1">
              {orderBook.asks.reverse().map((ask, index) => (
                <div key={index} className="grid grid-cols-2 text-sm">
                  <span className="text-red-500 font-mono">
                    {formatPrice(ask.price)}
                  </span>
                  <span className="text-right text-gray-600 dark:text-gray-300 font-mono">
                    {formatNumber(ask.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Current Price */}
          <div className="border-t border-b border-gray-200 dark:border-gray-600 py-2">
            <div className="text-center">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(priceData.price)}
              </span>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Last Price
              </div>
            </div>
          </div>

          {/* Bids (Buy Orders) */}
          <div>
            <div className="space-y-1">
              {orderBook.bids.map((bid, index) => (
                <div key={index} className="grid grid-cols-2 text-sm">
                  <span className="text-green-500 font-mono">
                    {formatPrice(bid.price)}
                  </span>
                  <span className="text-right text-gray-600 dark:text-gray-300 font-mono">
                    {formatNumber(bid.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Recent Trades
        </h3>
        
        <div className="space-y-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-3">
            <span>Time</span>
            <span className="text-right">Price</span>
            <span className="text-right">Amount</span>
          </div>
          
          {recentTrades.map((trade, index) => (
            <div key={index} className="grid grid-cols-3 text-sm">
              <span className="text-gray-600 dark:text-gray-300 font-mono">
                {trade.time}
              </span>
              <span className={`text-right font-mono ${
                trade.type === 'buy' ? 'text-green-500' : 'text-red-500'
              }`}>
                {formatPrice(trade.price)}
              </span>
              <span className="text-right text-gray-600 dark:text-gray-300 font-mono">
                {formatNumber(trade.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trading Stats */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          24h Statistics
        </h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">High:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(0.0205)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Low:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(0.0195)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Volume:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatNumber(2500000)} BAK
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Trades:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              1,247
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        
        <div className="space-y-3">
          <button className="btn-primary w-full">
            Buy BAK
          </button>
          <button className="btn-outline w-full">
            View Chart
          </button>
          <button className="btn-secondary w-full">
            Set Price Alert
          </button>
        </div>
      </div>
    </div>
  )
}