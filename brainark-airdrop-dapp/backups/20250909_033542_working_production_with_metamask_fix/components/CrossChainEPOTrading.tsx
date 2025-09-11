// Cross-Chain EPO Trading Component with Treasury Wallet Integration
import React, { useState, useCallback, useMemo, memo, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { EPO_CONFIG } from '@/utils/config'
import AutoWalletConnection from './AutoWalletConnection'
import { LockClosedIcon, LockOpenIcon, RefreshIcon, ArrowRightIcon, ExternalLinkIcon } from '@heroicons/react/24/outline'
import { EPOShaderBackground } from './shaders'
import { useOptimizedEPOContract } from '@/hooks/useOptimizedEPOContract'
import { useCrossChainEPOContract } from '@/hooks/useCrossChainEPOContract'
import { optimizedLiquidityTracker, checkSellPermission } from '@/utils/optimizedLiquidityTracker'
import { startTokenPriceUpdates } from '@/utils/multiNetworkConfig'

// Network chain IDs
const CHAIN_IDS = {
  ethereum: 1,
  bsc: 56, 
  polygon: 137,
  brainark: 424242
}

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

const NetworkSelector = memo<{
  selectedNetwork: string
  onNetworkSelect: (network: string) => void
}>(({ selectedNetwork, onNetworkSelect }) => {
  const networks = useMemo(() => [
    { key: 'ethereum', name: 'Ethereum', icon: '💎', chainId: CHAIN_IDS.ethereum, color: '#627eea' },
    { key: 'bsc', name: 'BSC', icon: '🟡', chainId: CHAIN_IDS.bsc, color: '#f3ba2f' },
    { key: 'polygon', name: 'Polygon', icon: '🟣', chainId: CHAIN_IDS.polygon, color: '#8247e5' },
  ], [])

  return (
    <div className="card-brilliant p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        🌐 Select Payment Network
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {networks.map((network) => (
          <div
            key={network.key}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              selectedNetwork === network.key
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onNetworkSelect(network.key)}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{network.icon}</span>
              <div>
                <div className="font-semibold text-gray-900">{network.name}</div>
                <div className="text-sm text-gray-600">Chain ID: {network.chainId}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

// Cross-chain token selector
const CrossChainTokenSelector = memo<{
  selectedToken: string
  selectedNetwork: string
  onTokenSelect: (token: string) => void
}>(({ selectedToken, selectedNetwork, onTokenSelect }) => {
  const supportedTokens = useMemo(() => {
    const tokens: Record<string, any> = {}
    
    // Network-specific tokens
    if (selectedNetwork === 'ethereum') {
      tokens.ETH = { symbol: 'ETH', name: 'Ethereum', icon: '💎', price: 3420.75, treasury: process.env.NEXT_PUBLIC_ETH_MAINNET_TREASURY, native: true }
      tokens.USDT = { symbol: 'USDT', name: 'Tether USD', icon: '💵', price: 1.00, treasury: process.env.NEXT_PUBLIC_USDT_ETHEREUM_TREASURY }
      tokens.USDC = { symbol: 'USDC', name: 'USD Coin', icon: '🔵', price: 1.00, treasury: process.env.NEXT_PUBLIC_USDC_ETHEREUM_TREASURY }
    } else if (selectedNetwork === 'bsc') {
      tokens.BNB = { symbol: 'BNB', name: 'Binance Coin', icon: '🟡', price: 635.50, treasury: process.env.NEXT_PUBLIC_BNB_BSC_TREASURY, native: true }
      tokens.USDT = { symbol: 'USDT', name: 'Tether USD (BSC)', icon: '💵', price: 1.00, treasury: process.env.NEXT_PUBLIC_USDT_BSC_TREASURY }
      tokens.USDC = { symbol: 'USDC', name: 'USD Coin (BSC)', icon: '🔵', price: 1.00, treasury: process.env.NEXT_PUBLIC_USDC_BSC_TREASURY }
    } else if (selectedNetwork === 'polygon') {
      tokens.MATIC = { symbol: 'MATIC', name: 'Polygon', icon: '🟣', price: 0.85, treasury: process.env.NEXT_PUBLIC_MATIC_POLYGON_TREASURY, native: true }
      tokens.USDT = { symbol: 'USDT', name: 'Tether USD (Polygon)', icon: '💵', price: 1.00, treasury: process.env.NEXT_PUBLIC_USDT_POLYGON_TREASURY }
      tokens.USDC = { symbol: 'USDC', name: 'USD Coin (Polygon)', icon: '🔵', price: 1.00, treasury: process.env.NEXT_PUBLIC_USDC_POLYGON_TREASURY }
    }
    
    return tokens
  }, [selectedNetwork])

  return (
    <div className="card-brilliant p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        💱 Select Payment Token on {selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              {token.native && (
                <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Native
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Treasury: {token.treasury?.slice(0, 8)}...{token.treasury?.slice(-6)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

const CrossChainEPOTrading: React.FC = () => {
  // State management
  const [address, setAddress] = useState<string>('')
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [selectedNetwork, setSelectedNetwork] = useState<string>('ethereum')
  const [selectedToken, setSelectedToken] = useState<string>('USDT')
  const [paymentAmount, setPaymentAmount] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  
  // Contract hooks
  const { stats: epoStats, isLoading: epoLoading, error: epoError } = useOptimizedEPOContract()
  const { 
    purchaseBakCrossChain, 
    calculateBAKAmount, 
    paymentHistory,
    isLoading: crossChainLoading,
    error: crossChainError 
  } = useCrossChainEPOContract()
  
  // Liquidity status
  const [liquidityStatus, setLiquidityStatus] = useState({
    canSell: false,
    totalLiquidity: '$0',
    remainingToUnlock: '$1,000,000',
    progressPercentage: 0,
    timeEstimate: 'Loading...'
  })

  // Contract data
  const contractData = useMemo(() => {
    if (!epoStats) return { totalSold: 0, currentPrice: 0.02, remainingSupply: 100000000, totalRaised: 0 }
    return {
      totalSold: parseFloat(epoStats.totalSold),
      currentPrice: parseFloat(epoStats.price),
      remainingSupply: parseFloat(epoStats.remainingSupply),
      totalRaised: parseFloat(epoStats.totalRaised)
    }
  }, [epoStats])

  // Calculate expected BAK
  const expectedBAK = useMemo(() => {
    if (!paymentAmount || isNaN(parseFloat(paymentAmount))) return '0'
    return calculateBAKAmount(paymentAmount, selectedToken)
  }, [paymentAmount, selectedToken, calculateBAKAmount])

  // Time remaining
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

  // Initialize token prices
  useEffect(() => {
    startTokenPriceUpdates()
  }, [])

  // Load liquidity status
  const loadLiquidityStatus = useCallback(async () => {
    try {
      const status = await optimizedLiquidityTracker.getLiquidityStatus()
      setLiquidityStatus(status)
    } catch (error) {
      console.error('Error loading liquidity status:', error)
    }
  }, [])

  useEffect(() => {
    loadLiquidityStatus()
  }, [loadLiquidityStatus])

  // Handle wallet connection
  const handleConnectionChange = useCallback((connected: boolean, walletAddress?: string, correctNetwork?: boolean) => {
    setIsConnected(connected)
    setAddress(walletAddress || '')
  }, [])

  // Get treasury address for selected token/network
  const getTreasuryAddress = useCallback(() => {
    const treasuryMap: Record<string, Record<string, string>> = {
      ethereum: {
        ETH: process.env.NEXT_PUBLIC_ETH_MAINNET_TREASURY || '',
        USDT: process.env.NEXT_PUBLIC_USDT_ETHEREUM_TREASURY || '',
        USDC: process.env.NEXT_PUBLIC_USDC_ETHEREUM_TREASURY || ''
      },
      bsc: {
        BNB: process.env.NEXT_PUBLIC_BNB_BSC_TREASURY || '',
        USDT: process.env.NEXT_PUBLIC_USDT_BSC_TREASURY || '',
        USDC: process.env.NEXT_PUBLIC_USDC_BSC_TREASURY || ''
      },
      polygon: {
        MATIC: process.env.NEXT_PUBLIC_MATIC_POLYGON_TREASURY || '',
        USDT: process.env.NEXT_PUBLIC_USDT_POLYGON_TREASURY || '',
        USDC: process.env.NEXT_PUBLIC_USDC_POLYGON_TREASURY || ''
      }
    }
    return treasuryMap[selectedNetwork]?.[selectedToken] || ''
  }, [selectedNetwork, selectedToken])

  // Execute cross-chain payment
  const executeCrossChainPayment = useCallback(async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount')
      return
    }

    if (timeRemaining <= 0) {
      toast.error('EPO has ended')
      return
    }

    const treasuryAddress = getTreasuryAddress()
    if (!treasuryAddress) {
      toast.error('Treasury address not configured for selected token/network')
      return
    }

    setIsProcessing(true)

    try {
      const payment = {
        paymentToken: selectedToken,
        paymentNetwork: selectedNetwork,
        paymentAmount,
        treasuryAddress,
        expectedBAK,
        chainId: CHAIN_IDS[selectedNetwork as keyof typeof CHAIN_IDS]
      }

      await purchaseBakCrossChain(payment)
      
      // Reset form
      setPaymentAmount('')
      
    } catch (error: any) {
      console.error('Cross-chain payment failed:', error)
      toast.error(`Payment failed: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }, [isConnected, address, paymentAmount, timeRemaining, getTreasuryAddress, selectedToken, selectedNetwork, expectedBAK, purchaseBakCrossChain])

  return (
    <div className="min-h-screen bg-deep-black py-8 relative">
      <EPOShaderBackground />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-500 via-green-600 to-teal-700 bg-clip-text text-transparent">
            🌐 Cross-Chain EPO Trading
          </h1>
          <p className="text-xl text-gray-300">
            Buy BAK with ETH, BNB, MATIC, USDT, USDC across multiple networks
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
          </div>
          
          <MemoizedProgressBar 
            percentage={(contractData.totalSold / EPO_CONFIG.TOTAL_SUPPLY) * 100}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Trading Section */}
          <div className="lg:col-span-2">
            <div className="card-dark p-6">
              <h2 className="text-2xl font-bold mb-6 text-white">
                🌐 Cross-Chain BAK Purchase
              </h2>
              
              {!isConnected ? (
                <div className="text-center py-12">
                  <p className="text-gray-300 mb-6">Connect wallet to start cross-chain trading</p>
                  <AutoWalletConnection onConnectionChange={handleConnectionChange} />
                </div>
              ) : (
                <div className="space-y-6">
                  <NetworkSelector
                    selectedNetwork={selectedNetwork}
                    onNetworkSelect={setSelectedNetwork}
                  />

                  <CrossChainTokenSelector
                    selectedToken={selectedToken}
                    selectedNetwork={selectedNetwork}
                    onTokenSelect={setSelectedToken}
                  />

                  {/* Payment Calculator */}
                  <div className="card-brilliant p-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">💰 Payment Calculator</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pay with {selectedToken}:
                        </label>
                        <input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Network: {selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <ArrowRightIcon className="h-8 w-8 text-emerald-500 mx-auto" />
                        <div className="text-sm text-gray-600 mt-1">Cross-Chain</div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          You receive BAK:
                        </label>
                        <div className="p-3 rounded-lg border-2 bg-green-50 border-green-200">
                          <span className="text-xl font-bold text-green-600">
                            {expectedBAK}
                          </span>
                          <span className="text-sm text-gray-600 ml-2">BAK</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Rate: $0.02 per BAK
                        </div>
                      </div>
                    </div>

                    {/* Treasury Address Display */}
                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                      <div className="text-sm font-medium text-blue-900">Payment Destination:</div>
                      <div className="font-mono text-sm text-blue-800">
                        {getTreasuryAddress() || 'Select token to see treasury address'}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        Your payment goes to BrainArk treasury → Oracle processes → BAK delivered to your wallet
                      </div>
                    </div>

                    <button
                      onClick={executeCrossChainPayment}
                      disabled={
                        !paymentAmount || 
                        parseFloat(paymentAmount) <= 0 || 
                        isProcessing || 
                        crossChainLoading ||
                        timeRemaining <= 0 || 
                        !getTreasuryAddress()
                      }
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                        isProcessing || crossChainLoading ? 'bg-yellow-500 text-white cursor-not-allowed' :
                        timeRemaining <= 0 ? 'bg-gray-400 text-gray-700 cursor-not-allowed' :
                        !getTreasuryAddress() ? 'bg-gray-400 text-gray-700 cursor-not-allowed' :
                        'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white'
                      }`}
                    >
                      {isProcessing || crossChainLoading ? '⏳ Processing Cross-Chain Payment...' : 
                       timeRemaining <= 0 ? '⏰ EPO Ended' :
                       !getTreasuryAddress() ? '❌ Treasury Not Configured' :
                       `🌐 Pay ${paymentAmount || '0'} ${selectedToken} → Get ${expectedBAK} BAK`}
                    </button>

                    {(crossChainError || epoError) && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-red-800 text-sm">
                          ❌ Error: {crossChainError || epoError}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment History */}
                  {paymentHistory.length > 0 && (
                    <div className="card-brilliant p-4">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">📜 Recent Payments</h3>
                      <div className="space-y-3">
                        {paymentHistory.slice(0, 5).map((payment, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium">
                                {payment.bakAmount} BAK
                              </div>
                              <div className="text-sm text-gray-600">
                                {new Date(payment.timestamp).toLocaleString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`px-2 py-1 rounded text-xs ${
                                payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                payment.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                payment.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {payment.status}
                              </div>
                              <a
                                href={`https://etherscan.io/tx/${payment.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLinkIcon className="h-4 w-4" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <div className="card-dark p-6">
              <h2 className="text-xl font-bold mb-4 text-white">🌐 Multi-Network Support</h2>
              
              <div className="space-y-4 text-sm text-gray-300">
                <div>
                  <div className="font-semibold text-white mb-2">💎 Ethereum Network</div>
                  <ul className="space-y-1 ml-4">
                    <li>• ETH (Native)</li>
                    <li>• USDT (ERC-20)</li>
                    <li>• USDC (ERC-20)</li>
                  </ul>
                </div>
                
                <div>
                  <div className="font-semibold text-white mb-2">🟡 BSC Network</div>
                  <ul className="space-y-1 ml-4">
                    <li>• BNB (Native)</li>
                    <li>• USDT (BEP-20)</li>
                    <li>• USDC (BEP-20)</li>
                  </ul>
                </div>
                
                <div>
                  <div className="font-semibold text-white mb-2">🟣 Polygon Network</div>
                  <ul className="space-y-1 ml-4">
                    <li>• MATIC (Native)</li>
                    <li>• USDT (PoS)</li>
                    <li>• USDC (PoS)</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-white mb-3">🔄 How It Works:</h3>
                <ol className="text-sm text-gray-300 space-y-2">
                  <li>1. Select network and token</li>
                  <li>2. Enter payment amount</li>
                  <li>3. Payment goes to treasury wallet</li>
                  <li>4. Oracle verifies payment</li>
                  <li>5. BAK tokens sent to your wallet</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CrossChainEPOTrading