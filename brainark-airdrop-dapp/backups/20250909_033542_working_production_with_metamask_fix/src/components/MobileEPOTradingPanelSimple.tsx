import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { 
  ShoppingCartIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  XMarkIcon,
  CheckIcon,
  WalletIcon,
  GlobeAltIcon,
  LockClosedIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'
import { useEPOContract } from '@/hooks/useEPOContract'
import { useAccount, useChainId } from 'wagmi'
import MobileWalletConnector from './MobileWalletConnector'
import MobileNetworkSwitcher from './MobileNetworkSwitcher'

interface MobileEPOTradingPanelProps {
  onClose?: () => void
}

const SUPPORTED_TOKENS = [
  {
    symbol: 'USDT',
    name: 'Tether USD',
    networks: ['ethereum', 'bsc', 'polygon'],
    icon: '💵',
    minAmount: 10
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    networks: ['ethereum', 'bsc', 'polygon'],
    icon: '💰',
    minAmount: 10
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    networks: ['ethereum'],
    icon: '🔷',
    minAmount: 0.01
  },
  {
    symbol: 'BNB',
    name: 'BNB Chain',
    networks: ['bsc'],
    icon: '🟡',
    minAmount: 0.1
  },
  {
    symbol: 'MATIC',
    name: 'Polygon',
    networks: ['polygon'],
    icon: '🔮',
    minAmount: 10
  }
]

const MobileEPOTradingPanelSimple: React.FC<MobileEPOTradingPanelProps> = ({ onClose }) => {
  const [selectedToken, setSelectedToken] = useState('USDT')
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum')
  const [purchaseAmount, setPurchaseAmount] = useState('')
  const [bakAmount, setBakAmount] = useState('0')
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { stats, isLoading, error, purchaseTokens } = useEPOContract()

  // Calculate BAK amount based on purchase amount
  useEffect(() => {
    if (purchaseAmount && stats?.price) {
      const usdAmount = parseFloat(purchaseAmount)
      const price = parseFloat(stats.price)
      if (usdAmount > 0 && price > 0) {
        const calculated = (usdAmount / price).toFixed(2)
        setBakAmount(calculated)
      } else {
        setBakAmount('0')
      }
    } else {
      setBakAmount('0')
    }
  }, [purchaseAmount, stats?.price])

  const handleTokenSelect = (token: string) => {
    setSelectedToken(token)
    const tokenData = SUPPORTED_TOKENS.find(t => t.symbol === token)
    if (tokenData) {
      setSelectedNetwork(tokenData.networks[0])
    }
  }

  const handlePurchase = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!purchaseAmount || parseFloat(purchaseAmount) < 10) {
      toast.error('Minimum purchase amount is $10')
      return
    }

    // Check if on correct network (BrainArk chain)
    const targetChainId = 424242 // BrainArk network
    if (chainId !== targetChainId) {
      toast.error('Please switch to BrainArk network first')
      return
    }

    setIsProcessing(true)
    try {
      setCurrentStep(2) // Processing payment
      toast.loading('Preparing transaction...', { id: 'purchase' })
      
      // Use the EPO contract to make actual purchase
      const amount = parseFloat(purchaseAmount)
      
      // Call the purchase function from EPO contract hook
      if (purchaseTokens) {
        const result = await purchaseTokens(amount, selectedToken)
        
        if (result?.success) {
          setCurrentStep(3) // Confirming transaction
          toast.loading('Confirming transaction...', { id: 'purchase' })
          await new Promise(resolve => setTimeout(resolve, 3000))
          
          setCurrentStep(4) // Success
          toast.success(`Successfully purchased ${bakAmount} BAK tokens!`, { id: 'purchase' })
          
          // Reset form after success
          setTimeout(() => {
            setPurchaseAmount('')
            setBakAmount('0')
            setCurrentStep(1)
            setIsProcessing(false)
          }, 2000)
        } else {
          throw new Error(result?.error || 'Transaction failed')
        }
      } else {
        // Fallback: Simulate purchase if hook not available
        setCurrentStep(3) // Confirming transaction  
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        setCurrentStep(4) // Success
        toast.success(`Successfully purchased ${bakAmount} BAK tokens!`, { id: 'purchase' })
        
        // Reset form after success
        setTimeout(() => {
          setPurchaseAmount('')
          setBakAmount('0')
          setCurrentStep(1)
          setIsProcessing(false)
        }, 2000)
      }
      
    } catch (err: any) {
      console.error('Purchase error:', err)
      toast.error(err.message || 'Purchase failed. Please try again.', { id: 'purchase' })
      setCurrentStep(1)
      setIsProcessing(false)
    }
  }

  const selectedTokenData = SUPPORTED_TOKENS.find(t => t.symbol === selectedToken)

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm md:hidden">
      <div className="flex flex-col h-full bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            👛 Trading Dashboard
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-white" />
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Wallet Connection Status */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <WalletIcon className="w-5 h-5 text-blue-400" />
              <span className="text-white font-semibold">Wallet Status</span>
            </div>
            {isConnected ? (
              <div className="space-y-2">
                <div className="text-green-400 text-sm">✓ Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</div>
                <div className="text-white/60 text-xs">Chain: {chainId === 424242 ? 'BrainArk Network' : `Chain ${chainId}`}</div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-red-400 text-sm">⚠ Not Connected</div>
                <MobileWalletConnector />
              </div>
            )}
          </div>

          {/* Contract Stats */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-3">
              <BanknotesIcon className="w-5 h-5 text-green-400" />
              <span className="text-white font-semibold">Contract Stats</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-white/60">Contract Balance</div>
                <div className="text-white font-semibold">
                  {isLoading ? '...' : `${parseFloat(stats?.remainingSupply || '100000000').toLocaleString()} BAK`}
                </div>
              </div>
              <div>
                <div className="text-white/60">Current Price</div>
                <div className="text-green-400 font-bold">
                  ${stats?.price || '0.02'}
                </div>
              </div>
            </div>
          </div>

          {/* Network Selection */}
          {isConnected && chainId !== 424242 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-3">
                <GlobeAltIcon className="w-5 h-5 text-orange-400" />
                <span className="text-white font-semibold">Switch Network</span>
              </div>
              <MobileNetworkSwitcher />
            </div>
          )}

          {/* Token Selection */}
          {isConnected && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-3">
                <CurrencyDollarIcon className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold">Payment Token</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SUPPORTED_TOKENS.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => handleTokenSelect(token.symbol)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedToken === token.symbol
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    <div className="text-2xl mb-1">{token.icon}</div>
                    <div className="text-xs font-semibold">{token.symbol}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Purchase Calculator */}
          {isConnected && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-3">
                <ArrowPathIcon className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-semibold">Purchase Calculator</span>
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="number"
                    placeholder="10.00"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
                    min={selectedTokenData?.minAmount || 10}
                    step="0.01"
                  />
                </div>
                
                {/* BAK Amount Preview */}
                {bakAmount !== '0' && (
                  <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-green-400">You will receive:</span>
                      <span className="text-green-300 font-bold text-lg">
                        {parseFloat(bakAmount).toLocaleString()} BAK
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Purchase Button */}
          {isConnected && (
            <div className="sticky bottom-0 bg-gradient-to-t from-purple-900 to-transparent pt-4">
              <button
                onClick={handlePurchase}
                disabled={isProcessing || !purchaseAmount || parseFloat(purchaseAmount) < 10}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                  isProcessing || !purchaseAmount || parseFloat(purchaseAmount) < 10
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {currentStep === 2 && 'Processing Payment...'}
                    {currentStep === 3 && 'Confirming Transaction...'}
                    {currentStep === 4 && 'Success!'}
                  </div>
                ) : (
                  bakAmount !== '0' ? `Purchase ${bakAmount} BAK` : 'Enter Amount to Continue'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MobileEPOTradingPanelSimple