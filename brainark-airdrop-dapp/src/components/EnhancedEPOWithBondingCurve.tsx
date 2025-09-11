import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { EPO_CONFIG } from '@/utils/config'
import AutoWalletConnection from './AutoWalletConnection'
import EnhancedMobileWalletConnector from './EnhancedMobileWalletConnector'
import MobileNetworkSwitcher from './MobileNetworkSwitcher'
import { CheckCircleIcon, XCircleIcon, ClockIcon, UserGroupIcon, ExclamationTriangleIcon, ShareIcon, LinkIcon, CalendarIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline'
import { EPOShaderBackground } from './shaders'
import { liquidityTracker, LIQUIDITY_LOCK_THRESHOLD, checkSellPermission } from '@/utils/liquidityTracker'
import { useUnifiedEPOContract } from '@/hooks/useUnifiedEPOContract'
import { startTokenPriceUpdates } from '@/utils/multiNetworkConfig'

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
  const [selectedNetwork, setSelectedNetwork] = useState<string>('')
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState<boolean>(false)
  const [purchaseAmount, setPurchaseAmount] = useState<string>('')
  const [bakAmount, setBakAmount] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [transactions, setTransactions] = useState<any[]>([])
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [slippage, setSlippage] = useState<number>(0.5)
  const [priceImpact, setPriceImpact] = useState<number>(0)
  const [quickActionsOpen, setQuickActionsOpen] = useState<boolean>(false)
  
  // Cross-Chain Token Data
  const getTokensForNetwork = (network: string) => {
    const networkTokens = {
      ethereum: [
        { symbol: 'ETH', name: 'Ethereum', icon: '💎', price: 3420.75, change24h: 1.85, native: true },
        { symbol: 'USDT', name: 'Tether USD', icon: '💵', price: 1.00, change24h: 0.01, native: false },
        { symbol: 'USDC', name: 'USD Coin', icon: '🔵', price: 1.00, change24h: -0.02, native: false }
      ],
      bsc: [
        { symbol: 'BNB', name: 'Binance Coin', icon: '🟡', price: 635.50, change24h: 2.45, native: true },
        { symbol: 'USDT', name: 'Tether USD (BSC)', icon: '💵', price: 1.00, change24h: 0.01, native: false },
        { symbol: 'USDC', name: 'USD Coin (BSC)', icon: '🔵', price: 1.00, change24h: -0.02, native: false }
      ],
      polygon: [
        { symbol: 'MATIC', name: 'Polygon', icon: '🟣', price: 0.85, change24h: 1.25, native: true },
        { symbol: 'USDT', name: 'Tether USD (Polygon)', icon: '💵', price: 1.00, change24h: 0.01, native: false },
        { symbol: 'USDC', name: 'USD Coin (Polygon)', icon: '🔵', price: 1.00, change24h: -0.02, native: false }
      ]
    }
    return networkTokens[network as keyof typeof networkTokens] || []
  }

  // Enhanced network switching with timeout and better error handling
  const switchToSelectedNetwork = async (networkKey: string) => {
    // Prevent multiple concurrent network switch attempts
    if (isSwitchingNetwork) {
      toast.error('Network switch already in progress, please wait...')
      return
    }
    
    const networkChainIds: Record<string, number> = {
      ethereum: 1,
      bsc: 56,
      polygon: 137
    }
    
    const chainId = networkChainIds[networkKey]
    if (!chainId || typeof window === 'undefined' || !window.ethereum) {
      toast.error('MetaMask not available or invalid network')
      return
    }

    setIsSwitchingNetwork(true)
    
    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Network switch timeout')), 30000) // 30 second timeout
    })
    
    // Enhanced user feedback
    const loadingToast = toast.loading(`Switching to ${networkKey.charAt(0).toUpperCase() + networkKey.slice(1)}...\nPlease approve in MetaMask`)
    
    try {
      const chainIdHex = `0x${chainId.toString(16)}`
      
      // Check if already on correct network
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })
      if (currentChainId === chainIdHex) {
        toast.dismiss(loadingToast)
        toast.success(`Already on ${networkKey.charAt(0).toUpperCase() + networkKey.slice(1)} network`)
        setSelectedNetwork(networkKey)
        return
      }
      
      // Try to switch with timeout
      const switchPromise = window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      })
      
      await Promise.race([switchPromise, timeoutPromise])
      
      // Verify the switch was successful
      const newChainId = await window.ethereum.request({ method: 'eth_chainId' })
      if (newChainId === chainIdHex) {
        toast.dismiss(loadingToast)
        toast.success(`Successfully switched to ${networkKey.charAt(0).toUpperCase() + networkKey.slice(1)}`)
        setSelectedNetwork(networkKey)
      } else {
        throw new Error('Network switch verification failed')
      }
      
    } catch (switchError: any) {
      toast.dismiss(loadingToast)
      
      // Handle timeout
      if (switchError.message === 'Network switch timeout') {
        toast.error('Network switch timed out. Please try manually switching in MetaMask', { duration: 6000 })
        return
      }
      
      // Handle user rejection
      if (switchError.code === 4001) {
        toast.error('Network switch was cancelled by user')
        return
      }
      
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          const networkConfigs: Record<string, any> = {
            ethereum: {
              chainId: '0x1',
              chainName: 'Ethereum Mainnet',
              nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://ethereum-rpc.publicnode.com', 'https://cloudflare-eth.com'],
              blockExplorerUrls: ['https://etherscan.io']
            },
            bsc: {
              chainId: '0x38',
              chainName: 'BSC Mainnet',
              nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
              rpcUrls: ['https://bsc-rpc.publicnode.com', 'https://bsc.meowrpc.com'],
              blockExplorerUrls: ['https://bscscan.com']
            },
            polygon: {
              chainId: '0x89',
              chainName: 'Polygon Mainnet',
              nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
              rpcUrls: ['https://polygon-bor-rpc.publicnode.com', 'https://polygon.meowrpc.com'],
              blockExplorerUrls: ['https://polygonscan.com']
            }
          }
          
          const addToast = toast.loading(`Adding ${networkKey.charAt(0).toUpperCase() + networkKey.slice(1)} network...`)
          
          const addPromise = window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfigs[networkKey]],
          })
          
          await Promise.race([addPromise, timeoutPromise])
          
          toast.dismiss(addToast)
          toast.success(`Added and switched to ${networkKey.charAt(0).toUpperCase() + networkKey.slice(1)}`)
          setSelectedNetwork(networkKey)
          
        } catch (addError: any) {
          console.error('Failed to add network:', addError)
          if (addError.message === 'Network switch timeout') {
            toast.error('Adding network timed out. Please add manually in MetaMask', { duration: 6000 })
          } else if (addError.code === 4001) {
            toast.error('Adding network was cancelled by user')
          } else {
            toast.error('Failed to add network to wallet')
          }
        }
      } else {
        console.error('Network switch error:', switchError)
        toast.error(`Network switch failed: ${switchError.message || 'Unknown error'}`, { duration: 5000 })
        
        // Provide manual instructions
        setTimeout(() => {
          toast(`💡 Manual Fix: Open MetaMask → Networks → Switch to ${networkKey.charAt(0).toUpperCase() + networkKey.slice(1)}`, {
            duration: 8000,
            icon: '💡'
          })
        }, 1000)
      }
    } finally {
      setIsSwitchingNetwork(false)
    }
  }

  // Get treasury address for selected token/network
  const getTreasuryAddress = () => {
    const treasuryMap: Record<string, Record<string, string>> = {
      ethereum: {
        ETH: process.env.NEXT_PUBLIC_ETH_MAINNET_TREASURY || '0xC91A5902da7321054cEdAeB49ce9A6a3835Fc417',
        USDT: process.env.NEXT_PUBLIC_USDT_ETHEREUM_TREASURY || '0xc9dE877a53f85BF51D76faed0C8c8842EFb35782',
        USDC: process.env.NEXT_PUBLIC_USDC_ETHEREUM_TREASURY || '0x3A9ca3d316F2032d3a21741cBea2e047fd3C1145'
      },
      bsc: {
        BNB: process.env.NEXT_PUBLIC_BNB_BSC_TREASURY || '0x794F67aA174bD0A252BeCA0089490a58Cc695a05',
        USDT: process.env.NEXT_PUBLIC_USDT_BSC_TREASURY || '0xC13527f3bBAaf4cd726d07a78da9C5b74876527F',
        USDC: process.env.NEXT_PUBLIC_USDC_BSC_TREASURY || '0x21FCcbB9b9b7c620BCbA61B6668C30F64C22859c'
      },
      polygon: {
        MATIC: process.env.NEXT_PUBLIC_MATIC_POLYGON_TREASURY || '0x6351f025E2DDe967A1FAD29d0fF44C3620F4EED7',
        USDT: process.env.NEXT_PUBLIC_USDT_POLYGON_TREASURY || '0xd413afAB39D24462ACE36CFE5D710Ce9B813c84B',
        USDC: process.env.NEXT_PUBLIC_USDC_POLYGON_TREASURY || '0xE97BF18735a1AB4A1bA9DDF284D7798A5B0f8a84'
      }
    }
    const address = treasuryMap[selectedNetwork]?.[selectedToken] || 'Not configured'
    return address
  }

  // Use real EPO contract data - try multiple data sources
  const { stats, isLoading, error, refetch, purchaseBAK, isTransactionPending } = useUnifiedEPOContract()
  
  // Use unified EPO contract data
  const currentStats = stats
  const isStatsLoading = isLoading
  
  // Initialize token price updates on component mount
  useEffect(() => {
    startTokenPriceUpdates()
  }, [])
  const [bondingCurve, setBondingCurve] = useState<BondingCurveData>({
    currentPrice: 0.02,
    nextPrice: 0.02,
    priceImpact: 0,
    totalSupply: 100000000,
    circulatingSupply: 0,
    marketCap: 0,
    liquidityPool: 2000000
  })
  
  // Get real contract data
  const totalSold = stats ? parseFloat(stats.totalSold) : 0
  const currentPrice = currentStats ? parseFloat(currentStats.price) : 0.02
  const remainingSupply = currentStats ? parseFloat(currentStats.remainingSupply) : 100000000
  const totalRaised = currentStats ? parseFloat(currentStats.totalRaised) : 0
  const contractBalance = currentStats ? parseFloat(currentStats.contractBalance) : 0
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy')
  
  // Liquidity lock state
  const [liquidityStatus, setLiquidityStatus] = useState({
    canSell: false,
    totalLiquidity: '$0',
    remainingToUnlock: '$1,000,000',
    progressPercentage: 0,
    timeEstimate: 'Loading...'
  })
  const [liquidityLoading, setLiquidityLoading] = useState(true)

  // Enhanced EPO Configuration with Bonding Curve
  // Enhanced EPO Configuration with Dual Pricing for Liquidity
  const BUY_MIN_PRICE = 0.02 // $0.02 - Minimum buy price (bonding curve start)
  const BUY_MAX_PRICE = 0.04 // $0.04 - Maximum buy price (bonding curve end)
  const SELL_FIXED_PRICE = 0.015 // $0.015 - Fixed sell price for liquidity
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
  // Bonding Curve Calculation for Buying (Dynamic Price)
  const calculateBuyPrice = (circulatingSupply: number): number => {
    // Linear bonding curve from $0.02 to $0.04 for buying
    const progress = circulatingSupply / TOTAL_EPO_SUPPLY
    return BUY_MIN_PRICE + (BUY_MAX_PRICE - BUY_MIN_PRICE) * progress
  }

  // Fixed Sell Price for Liquidity
  const calculateSellPrice = (): number => {
    // Fixed price of $0.015 for all sells to create liquidity
    return SELL_FIXED_PRICE
  }

  // Calculate tokens for USD amount using bonding curve
  const calculateTokensFromUSD = (usdAmount: number, currentSupply: number): { tokens: number, avgPrice: number, priceImpact: number } => {
    let remainingUSD = usdAmount
    let totalTokens = 0
    let currentSupplyTemp = currentSupply
    const startPrice = calculateBuyPrice(currentSupplyTemp)
    
    // Simulate buying in small increments to calculate average price
    const increment = 1000 // Buy in 1000 token increments for precision
    
    while (remainingUSD > 0 && currentSupplyTemp < TOTAL_EPO_SUPPLY) {
      const currentPrice = calculateBuyPrice(currentSupplyTemp)
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
    const endPrice = calculateBuyPrice(currentSupplyTemp)
    const priceImpact = totalTokens > 0 ? ((endPrice - startPrice) / startPrice) * 100 : 0
    
    return { tokens: totalTokens, avgPrice, priceImpact }
  }

  // Calculate USD for token amount using bonding curve
  // Calculate USD for token amount using fixed sell price
  const calculateUSDFromTokens = (tokenAmount: number, currentSupply: number): { usd: number, avgPrice: number, priceImpact: number } => {
    // Use fixed sell price for all sells
    const sellPrice = calculateSellPrice()
    const totalUSD = tokenAmount * sellPrice
    
    // No price impact for fixed price selling
    const priceImpact = 0
    
    return { usd: totalUSD, avgPrice: sellPrice, priceImpact }
  }

  // Update bonding curve data with real contract data
  useEffect(() => {
    if (stats) {
      const nextPrice = calculateBuyPrice(totalSold + 1000) // Price after buying 1000 tokens
      const marketCap = totalSold * currentPrice
      
      setBondingCurve({
        currentPrice: currentPrice,
        nextPrice,
        priceImpact: 0,
        totalSupply: TOTAL_EPO_SUPPLY,
        circulatingSupply: totalSold,
        marketCap,
        liquidityPool: contractBalance + marketCap * 0.1 // Contract balance + estimated liquidity
      })
    }
  }, [stats, totalSold, currentPrice, contractBalance])

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

  // Removed mock transaction calculation - now using real contract data
  // Real totalSold comes from epoStats.totalSold

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

  // Calculate BAK tokens using real contract price
  useEffect(() => {
    if (purchaseAmount && !isNaN(parseFloat(purchaseAmount)) && currentPrice > 0) {
      const selectedTokenData = supportedTokens[selectedToken]
      const tokenAmount = parseFloat(purchaseAmount)
      const usdValue = tokenAmount * selectedTokenData.price
      
      if (tradeMode === 'buy') {
        // Simple calculation using current contract price
        const bakTokens = usdValue / currentPrice
        setBakAmount(bakTokens.toFixed(2))
        setPriceImpact(0) // Minimal price impact for now
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
  }, [purchaseAmount, selectedToken, currentPrice, tradeMode])

  // Real Purchase Function using BrainArkEPOComplete contract
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

    if (remainingSupply <= 0) {
      toast.error('All BAK tokens have been sold')
      return
    }

    setIsProcessing(true)

    try {
      const selectedTokenData = supportedTokens[selectedToken]
      const inputAmount = parseFloat(purchaseAmount)
      
      if (tradeMode === 'buy') {
        // Convert input to wei for contract call (assuming ETH payment for now)
        const ethAmount = inputAmount * selectedTokenData.price / 3420.75 // Rough ETH conversion
        const weiAmount = Math.round(ethAmount * 1e18).toString()
        
        // Call real contract purchase function
        const txHash = await purchaseBAK(weiAmount)
        
        toast.success(
          `Purchase transaction submitted!\nTx Hash: ${txHash}\nExpected BAK: ${bakAmount} tokens`,
          { duration: 8000 }
        )
        
        // Refresh contract data after purchase
        setTimeout(() => {
          refetch()
        }, 3000)
        
      } else {
        // Sell mode - Check liquidity lock first
        const sellPermission = await checkSellPermission()
        if (!sellPermission) {
          toast.error(
            `Selling is locked until $1M liquidity generation. Current: ${liquidityStatus.totalLiquidity}`,
            { duration: 6000 }
          )
          setIsProcessing(false)
          return
        }
        
        // Selling not implemented in BrainArkEPOComplete yet
        toast.error('Selling functionality coming soon. Contract currently only supports buying.')
        setIsProcessing(false)
        return
      }
      
      // Reset form
      setPurchaseAmount('')
      setBakAmount('')
      setPriceImpact(0)

    } catch (error: any) {
      console.error('Trade failed:', error)
      toast.error(`Transaction failed: ${error.message || 'Please try again'}`)
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

  // Load liquidity status
  useEffect(() => {
    const loadLiquidityStatus = async () => {
      setLiquidityLoading(true)
      try {
        const status = await liquidityTracker.getLiquidityStatus()
        setLiquidityStatus(status)
      } catch (error) {
        console.error('Error loading liquidity status:', error)
        toast.error('Failed to load liquidity status')
      } finally {
        setLiquidityLoading(false)
      }
    }

    loadLiquidityStatus()
    
    // Refresh every 5 minutes
    const interval = setInterval(loadLiquidityStatus, 5 * 60 * 1000)
    return () => clearInterval(interval)
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
      <div className="fixed top-4 right-2 sm:right-4 z-50">
        <button
          onClick={() => setQuickActionsOpen(!quickActionsOpen)}
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-3 py-2 rounded-lg shadow-lg transition-all duration-200 mb-2 text-sm font-medium"
        >
          ⚡ Quick Buy {quickActionsOpen ? '▼' : '▶'}
        </button>

        {quickActionsOpen && (
          <div className="bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800 text-white rounded-lg shadow-2xl border border-emerald-500 backdrop-blur-sm p-3 min-w-[200px] animate-fade-in">
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-medium py-2 px-3 rounded text-xs transition-all duration-200 hover:scale-105"
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
            {isLoading ? 'Loading contract data...' : (
              `${totalSold.toLocaleString()} / ${TOTAL_EPO_SUPPLY.toLocaleString()} BAK Sold (${((totalSold / TOTAL_EPO_SUPPLY) * 100).toFixed(2)}%)`
            )}
          </div>
          {error && (
            <div className="text-sm text-red-600 mt-2">
              Contract Status: {error?.message || 'Connecting...'}
            </div>
          )}
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-6 mb-4">
          <div 
            className="bg-gradient-to-r from-emerald-400 to-green-600 h-6 rounded-full transition-all duration-500 flex items-center justify-center"
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


  // Liquidity Lock Progress Display
  const LiquidityLockDisplay: React.FC = () => {
    const LockIcon = liquidityStatus.canSell ? LockOpenIcon : LockClosedIcon
    const lockColor = liquidityStatus.canSell ? 'text-green-500' : 'text-red-500'
    
    return (
      <div className="card-brilliant p-6 mb-6">
        <div className="flex items-center justify-center mb-4">
          <LockIcon className={`h-8 w-8 ${lockColor} mr-3`} />
          <h3 className="text-2xl font-bold text-gray-900">
            🏦 Treasury Liquidity Lock
          </h3>
        </div>
        
        {liquidityLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading liquidity data...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {liquidityStatus.totalLiquidity} / $1,000,000
              </div>
              <div className="text-lg text-gray-700 mb-2">
                {liquidityStatus.canSell ? (
                  <span className="text-green-600 font-semibold">
                    🔓 After $1M dollar liquidity generation: Selling unlocked at a fixed price, please bear with us as we are generating liquidity for the project.
                  </span>
                ) : (
                  <span className="text-red-600">
                    🔒 Selling Locked - Need {liquidityStatus.remainingToUnlock} more
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Estimated time to unlock: {liquidityStatus.timeEstimate}
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-6 mb-4">
              <div 
                className={`h-6 rounded-full transition-all duration-500 flex items-center justify-center ${
                  liquidityStatus.canSell 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-600' 
                    : 'bg-gradient-to-r from-orange-400 to-red-500'
                }`}
                style={{ width: `${Math.min(liquidityStatus.progressPercentage, 100)}%` }}
              >
                {liquidityStatus.progressPercentage > 10 && (
                  <span className="text-white text-sm font-medium">
                    {liquidityStatus.progressPercentage.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-sm text-blue-600 font-semibold">Current Liquidity</div>
                <div className="text-lg font-bold text-blue-800">{liquidityStatus.totalLiquidity}</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <div className="text-sm text-orange-600 font-semibold">Remaining to Unlock</div>
                <div className="text-lg font-bold text-orange-800">{liquidityStatus.remainingToUnlock}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-sm text-green-600 font-semibold">Progress</div>
                <div className="text-lg font-bold text-green-800">{liquidityStatus.progressPercentage.toFixed(1)}%</div>
              </div>
            </div>

            {!liquidityStatus.canSell && (
              <div className="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                  <p className="text-yellow-800 text-sm font-semibold">
                    Selling BAK native coins is temporarily locked to ensure liquidity for all users.
                  </p>
                </div>
                <p className="text-yellow-700 text-sm mt-2">
                  After $1M dollar liquidity generation: Selling will be unlocked at a fixed price. Please bear with us as we are generating liquidity for the project.
                  This ensures stable liquidity and protects all investors.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // Bonding Curve Display
  const BondingCurveDisplay: React.FC = () => {
    const priceChange = bondingCurve.nextPrice - bondingCurve.currentPrice

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
                <span className="ml-1 text-green-500">📈</span>
              ) : (
                <span className="ml-1 text-red-500">📉</span>
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
          <h4 className="font-medium text-gray-900 mb-2">💰 Liquidity Creation System:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Purpose:</strong> Creating sustainable liquidity for project development</li>
            <li>• <strong>Buy Price:</strong> $0.02 - $0.04 (bonding curve funds development)</li>
            <li>• <strong>Sell Price:</strong> $0.015 (fixed price creates project liquidity)</li>
            <li>• <strong>Benefit:</strong> Price difference funds security, features, and growth</li>
            <li>• <strong>Current Buy Price:</strong> ${bondingCurve.currentPrice.toFixed(4)}</li>
            <li>• <strong>Guaranteed Sell Price:</strong> $0.015 (always available)</li>
            <li>• <strong>Your Impact:</strong> Every trade helps build the BrainArk ecosystem</li>
            <li>• <strong>Post-EPO Plan:</strong> Liquidity migrates to PancakeSwap & Uniswap for public trading</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-deep-black py-8 relative">
      {/* Shader Background */}
      <EPOShaderBackground />
      <QuickActionsTab />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-500 via-green-600 to-teal-700 bg-clip-text text-transparent">
            🦄 BrainArk EPO - Enhanced Trading Platform
          </h1>
          <p className="text-xl text-gray-300">
            Advanced trading interface with bonding curve pricing and 100M BAK token supply
          </p>
        </div>

        <EPOProgressDisplay />
        <LiquidityLockDisplay />
        <BondingCurveDisplay />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
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
                  
                  {/* Mobile-first wallet connection */}
                  <div className="block md:hidden mb-6">
                    <EnhancedMobileWalletConnector 
                      onNetworkChange={(chainId) => {
                        console.log('Network changed to:', chainId)
                        // Update selected network based on chain ID
                        const networkMap: Record<number, string> = {
                          1: 'ethereum',
                          56: 'bsc',
                          137: 'polygon',
                          424242: 'brainark'
                        }
                        const newNetwork = networkMap[chainId]
                        if (newNetwork && newNetwork !== 'brainark') {
                          setSelectedNetwork(newNetwork)
                        }
                      }}
                    />
                  </div>
                  
                  {/* Desktop wallet connection */}
                  <div className="hidden md:block">
                    <AutoWalletConnection onConnectionChange={handleConnectionChange} />
                  </div>
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
                        <div className="text-sm text-gray-600">Contract Balance:</div>
                        <div className="font-semibold">
                          {isStatsLoading ? 'Loading...' : `${contractBalance.toLocaleString()} BAK`}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Total Raised:</div>
                        <div className="font-semibold text-green-600">
                          {isLoading ? 'Loading...' : `$${totalRaised.toFixed(2)}`}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Remaining Supply:</div>
                        <div className="font-semibold">
                          {isLoading ? 'Loading...' : `${remainingSupply.toFixed(0)} BAK`}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Contract Status:</div>
                        <div className="font-semibold">
                          {isStatsLoading ? 'Loading...' : (contractBalance > 0 ? 'Active' : 'Error')}
                        </div>
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
                        disabled={!liquidityStatus.canSell}
                        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 relative ${
                          !liquidityStatus.canSell
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : tradeMode === 'sell'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        title={!liquidityStatus.canSell ? 'Selling locked until treasury reaches $1M' : ''}
                      >
                        {!liquidityStatus.canSell && (
                          <LockClosedIcon className="h-4 w-4 inline mr-1" />
                        )}
                        💰 Sell BAK
                        {!liquidityStatus.canSell && (
                          <span className="text-xs block">Locked</span>
                        )}
                      </button>
                    </div>
                    
                    {/* Pricing Explanation */}
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">💰 Liquidity Creation System</h4>
                      <p className="text-sm text-blue-800 mb-3">
                        <strong>We're creating liquidity for the project!</strong> The price difference funds development, 
                        security, and ecosystem growth. Your trades help build the future of BrainArk.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                        <div className="bg-green-100 p-3 rounded">
                          <strong>🛒 Buy Price:</strong> $0.02 - $0.04<br/>
                          <span className="text-xs">Bonding curve - funds project development</span>
                        </div>
                        <div className="bg-orange-100 p-3 rounded">
                          <strong>💰 Sell Price:</strong> $0.015 (Fixed)<br/>
                          <span className="text-xs">Guaranteed exit - creates project liquidity</span>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                        <strong>💡 How it works:</strong> The difference between buy and sell prices creates 
                        sustainable funding for platform development, security audits, and ecosystem expansion.
                      </div>
                      <div className="mt-2 p-2 bg-green-100 rounded text-xs text-green-800">
                        <strong>🚀 After EPO:</strong> Once 100M BAK tokens are sold, all liquidity will be 
                        migrated to PancakeSwap and Uniswap for fully public trading with market-driven pricing.
                      </div>
                    </div>
                  </div>

                  {/* Cross-Chain Token Selection */}
                  {tradeMode === 'buy' && (
                    <>
                      {/* Network Selection */}
                      <div className="card-brilliant p-4">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">
                          🌐 Select Payment Network
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { key: 'ethereum', name: 'Ethereum', icon: '💎', chainId: 1, color: 'text-blue-500' },
                            { key: 'bsc', name: 'BSC', icon: '🟡', chainId: 56, color: 'text-yellow-500' },
                            { key: 'polygon', name: 'Polygon', icon: '🟣', chainId: 137, color: 'text-purple-500' },
                          ].map((network) => (
                            <div
                              key={network.key}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                selectedNetwork === network.key
                                  ? 'border-emerald-500 bg-emerald-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setSelectedNetwork(network.key)}
                            >
                              <div className="text-center">
                                <div className="text-3xl mb-2">{network.icon}</div>
                                <div className="font-semibold text-gray-900">{network.name}</div>
                                <div className={`text-sm ${network.color}`}>Chain: {network.chainId}</div>
                                {selectedNetwork === network.key && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      switchToSelectedNetwork(network.key)
                                    }}
                                    disabled={isSwitchingNetwork}
                                    className={`mt-2 px-3 py-1 text-white text-xs rounded-full transition-colors duration-200 ${
                                      isSwitchingNetwork 
                                        ? 'bg-yellow-500 cursor-not-allowed' 
                                        : 'bg-emerald-500 hover:bg-emerald-600'
                                    }`}
                                  >
                                    {isSwitchingNetwork ? '⏳ Switching...' : '🔄 Switch Network'}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cross-Chain Token Selection */}
                      <div className="card-brilliant p-4">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">
                          💱 Select Payment Token {selectedNetwork ? `on ${selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)}` : '(Select Network First)'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {getTokensForNetwork(selectedNetwork).map((token) => (
                            <div
                              key={token.symbol}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                selectedToken === token.symbol
                                  ? 'border-emerald-500 bg-emerald-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setSelectedToken(token.symbol)}
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
                              {token.native && (
                                <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-2">
                                  Native Token
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Regular Token Selection for Sell */}
                  {tradeMode === 'sell' && (
                    <div className="card-brilliant p-4">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">
                        💱 Select Receive Token
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
                  )}

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
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:ring-emerald-500 focus:border-emerald-500"
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
                        <div className="text-2xl text-emerald-500">
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

                    {/* Cross-Chain Treasury Info */}
                    {tradeMode === 'buy' && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-blue-900">🌐 Cross-Chain Payment Details</h4>
                          <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            💡 Switch network for seamless payment
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-800">Network:</span>
                            <span className="font-medium text-blue-900">{selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-800">Payment Token:</span>
                            <span className="font-medium text-blue-900">{selectedToken}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-800">Treasury Address:</span>
                            <span className="font-mono text-xs text-blue-900">
                              {getTreasuryAddress()}
                            </span>
                          </div>
                          <div className="text-xs text-blue-600 mt-2">
                            💡 Your payment goes to BrainArk treasury → Oracle processes → BAK delivered to your wallet
                          </div>
                          <button
                            onClick={() => switchToSelectedNetwork(selectedNetwork)}
                            disabled={isSwitchingNetwork}
                            className={`mt-3 w-full px-4 py-2 font-medium rounded-lg transition-all duration-200 text-sm ${
                              isSwitchingNetwork
                                ? 'bg-yellow-500 cursor-not-allowed text-white'
                                : 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white'
                            }`}
                          >
                            {isSwitchingNetwork 
                              ? '⏳ Switching Network...' 
                              : `🔄 Switch to ${selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)} Network`
                            }
                          </button>
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
                       tradeMode === 'buy' ? `🌐 Buy ${bakAmount || '0'} BAK with ${selectedToken} (${selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)})` : `💰 Sell ${purchaseAmount || '0'} BAK`}
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
                  <div className="font-semibold text-white">
                    {isLoading ? 'Loading...' : `$${currentPrice.toFixed(4)}`}
                  </div>
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
                  <div className="font-semibold text-white">
                    {isLoading ? 'Loading...' : `${totalSold.toFixed(0)} BAK`}
                  </div>
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
                  <li>• <strong>Post-EPO:</strong> Liquidity migrates to PancakeSwap & Uniswap</li>
                  <li>• <strong>Public Trading:</strong> Full market pricing after EPO completion</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedEPOWithBondingCurve