import { useState, useEffect } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { toast } from 'react-hot-toast'
import { ethers } from 'ethers'
import { CurrencyDollarIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline'
import { EPO_CONFIG, CONTRACT_ADDRESSES } from '@/utils/config'
import { contractHelpers, parseContractError, waitForTransaction } from '@/utils/contracts'
import AutoWalletConnection from './AutoWalletConnection'

interface PaymentToken {
  symbol: string
  name: string
  address: string
  decimals: number
  price: number // USD price
  icon: string
}

interface EPOData {
  totalSold: number
  totalRaised: number
  remainingSupply: number
  isActive: boolean
}

export default function EPOSection() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  
  const [epoData, setEpoData] = useState<EPOData>({
    totalSold: 0,
    totalRaised: 0,
    remainingSupply: EPO_CONFIG.TOTAL_SUPPLY,
    isActive: true
  })
  
  const [loading, setLoading] = useState(true)

  const [selectedToken, setSelectedToken] = useState<PaymentToken>({
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    price: 3000, // Current ETH price estimate
    icon: '⟠'
  })

  const [paymentAmount, setPaymentAmount] = useState('')
  const [bakAmount, setBakAmount] = useState('')
  const [purchasing, setPurchasing] = useState(false)

  const paymentTokens: PaymentToken[] = [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      address: ethers.ZeroAddress,
      decimals: 18,
      price: 2000, // This will be updated from contract
      icon: '⟠'
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      address: CONTRACT_ADDRESSES.USDT,
      decimals: 6,
      price: 1,
      icon: '₮'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: CONTRACT_ADDRESSES.USDC,
      decimals: 6,
      price: 1,
      icon: '◉'
    },
    {
      symbol: 'BNB',
      name: 'Binance Coin',
      address: CONTRACT_ADDRESSES.BNB,
      decimals: 18,
      price: 300, // This will be updated from contract
      icon: '◆'
    }
  ]

  useEffect(() => {
    if (publicClient) {
      loadEpoData()
      loadTokenPrices()
    }
  }, [publicClient])
  
  useEffect(() => {
    if (paymentAmount && !isNaN(Number(paymentAmount))) {
      calculateBakAmountFromContract(Number(paymentAmount))
    } else {
      setBakAmount('')
    }
  }, [paymentAmount, selectedToken])
  
  const loadEpoData = async () => {
    try {
      setLoading(true)
      // Get actual data from the contract
      const stats = await contractHelpers.getEPOStats(publicClient)
      setEpoData({
        totalSold: Number(ethers.formatEther(stats.totalSold)),
        totalRaised: Number(ethers.formatEther(stats.totalRaised)),
        remainingSupply: EPO_CONFIG.TOTAL_SUPPLY - Number(ethers.formatEther(stats.totalSold)),
        isActive: !stats.isPaused
      })
    } catch (error) {
      console.error('Error loading EPO data:', error)
      toast.error('Failed to load EPO data')
    } finally {
      setLoading(false)
    }
  }
  
  const loadTokenPrices = async () => {
    try {
      // Create a copy of the payment tokens array
      const updatedTokens = [...paymentTokens]
      
      // Update each token with actual price from contract
      for (let i = 0; i < updatedTokens.length; i++) {
        try {
          const tokenInfo = await contractHelpers.getPaymentTokenInfo(updatedTokens[i].address, publicClient)
          if (tokenInfo) {
            updatedTokens[i].price = Number(ethers.formatEther(tokenInfo.priceUSD))
            updatedTokens[i].decimals = tokenInfo.decimals
          }
        } catch (err) {
          console.error(`Error loading price for ${updatedTokens[i].symbol}:`, err)
        }
      }
      
      // Find and update selected token if it exists in the updated list
      const updatedSelected = updatedTokens.find(token => token.symbol === selectedToken.symbol)
      if (updatedSelected) {
        setSelectedToken(updatedSelected)
      }
    } catch (error) {
      console.error('Error loading token prices:', error)
    }
  }

  const calculateBakAmount = (amount: number) => {
    const usdValue = amount * selectedToken.price
    // Fallback calculation if contract call fails
    const bakTokens = usdValue / EPO_CONFIG.PRICE_START
    setBakAmount(bakTokens.toFixed(2))
  }
  
  const calculateBakAmountFromContract = async (amount: number) => {
    try {
      if (!publicClient || amount <= 0) return
      
      // Convert to USD value based on token price
      const usdValue = amount * selectedToken.price
      
      // Call contract to calculate based on bonding curve
      const result = await contractHelpers.calculatePurchase(
        selectedToken.address, 
        usdValue.toString(), 
        publicClient
      )
      
      // Set BAK amount from contract calculation
      setBakAmount(ethers.formatEther(result[0]))
    } catch (error) {
      console.error('Error calculating BAK amount:', error)
      // Fallback to local calculation
      calculateBakAmount(amount)
    }
  }

  const handlePurchase = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!paymentAmount || !bakAmount) {
      toast.error('Please enter a valid amount')
      return
    }

    const amount = Number(paymentAmount)
    if (amount <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }

    setPurchasing(true)

    try {
      // Calculate minimum acceptable BAK amount (5% slippage tolerance)
      const minBakAmount = (Number(bakAmount) * 0.95).toString()
      
      // If token is not ETH (zero address), need to approve first
      if (selectedToken.address !== ethers.ZeroAddress) {
        // Show approval toast
        toast.loading('Please approve token spending in your wallet...', {
          id: 'approval-toast'
        })
        
        try {
          // Create ERC20 contract
          const erc20 = new ethers.Contract(
            selectedToken.address,
            ['function approve(address spender, uint256 amount) returns (bool)'],
            walletClient
          )
          
          // Approve EPO contract to spend tokens
          const approvalTx = await erc20.approve(
            CONTRACT_ADDRESSES.EPO,
            ethers.parseUnits(paymentAmount, selectedToken.decimals)
          )
          
          // Wait for approval transaction
          await waitForTransaction(approvalTx.hash, publicClient)
          
          toast.success('Approval successful! Continuing with purchase...', {
            id: 'approval-toast'
          })
        } catch (err) {
          toast.error('Token approval failed', {
            id: 'approval-toast'
          })
          throw err
        }
      }
      
      // Execute actual purchase via contract
      const tx = await contractHelpers.purchaseBAK(
        selectedToken.address,
        paymentAmount,
        minBakAmount,
        walletClient
      )
      
      toast.loading('Transaction submitted! Please wait for confirmation...', {
        id: 'transaction-toast'
      })
      
      // Wait for transaction confirmation
      const receipt = await waitForTransaction(tx.hash, publicClient)
      
      // Update EPO data
      await loadEpoData()
      
      // Save transaction data for success page
      const transactionData = {
        type: 'epo',
        amount: bakAmount,
        token: `${paymentAmount} ${selectedToken.symbol}`,
        txHash: receipt.hash,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('lastTransaction', JSON.stringify(transactionData))

      toast.success('Purchase successful!', {
        id: 'transaction-toast'
      })
      
      // Reset form
      setPaymentAmount('')
      setBakAmount('')
      
      // Redirect to success page
      setTimeout(() => {
        window.location.href = '/success'
      }, 2000)

    } catch (error) {
      console.error('Error purchasing tokens:', error)
      const errorMessage = parseContractError(error)
      toast.error(`Purchase failed: ${errorMessage}`, {
        id: 'transaction-toast'
      })
    } finally {
      setPurchasing(false)
    }
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            💰 Early Public Offering (EPO)
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Purchase BAK tokens with a dynamic bonding curve starting at ${EPO_CONFIG.PRICE_START} and ending at ${EPO_CONFIG.PRICE_END}. 
            Pay with ETH, USDT, USDC, or BNB. No time limits, no KYC required.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brainark-500 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300">Loading EPO data from blockchain...</p>
          </div>
        )}

        {/* EPO Stats */}
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 ${loading ? 'opacity-50' : ''}`}>
          <div className="card text-center">
            <CurrencyDollarIcon className="h-8 w-8 text-brainark-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-brainark-500 mb-1">
              ${EPO_CONFIG.PRICE_START} - ${EPO_CONFIG.PRICE_END}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">Price per BAK</p>
          </div>
          
          <div className="card text-center">
            <ChartBarIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-green-500 mb-1">
              {formatNumber(epoData.totalSold)}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">Tokens Sold</p>
          </div>
          
          <div className="card text-center">
            <div className="h-8 w-8 text-purple-500 mx-auto mb-2 flex items-center justify-center text-2xl">
              💎
            </div>
            <h3 className="text-2xl font-bold text-purple-500 mb-1">
              {formatCurrency(epoData.totalRaised)}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">Total Raised</p>
          </div>
          
          <div className="card text-center">
            <ClockIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-blue-500 mb-1">
              ∞
            </h3>
            <p className="text-gray-600 dark:text-gray-300">No Time Limit</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="card mb-12">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              EPO Progress
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatNumber(epoData.remainingSupply)} BAK remaining
            </span>
          </div>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div 
              className="bg-brainark-gradient h-4 rounded-full transition-all duration-500"
              style={{ 
                width: `${(epoData.totalSold / EPO_CONFIG.TOTAL_SUPPLY) * 100}%` 
              }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
            <span>0</span>
            <span>{formatNumber(EPO_CONFIG.TOTAL_SUPPLY)} BAK</span>
          </div>
        </div>

        {!isConnected ? (
          /* Connect Wallet */
          <AutoWalletConnection />
        ) : (
          /* Purchase Interface */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Purchase Form */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Purchase BAK Tokens
              </h2>

              {/* Token Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Payment Token
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {paymentTokens.map((token) => (
                    <button
                      key={token.symbol}
                      onClick={() => setSelectedToken(token)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        selectedToken.symbol === token.symbol
                          ? 'border-brainark-500 bg-brainark-50 dark:bg-brainark-900'
                          : 'border-gray-300 dark:border-gray-600 hover:border-brainark-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{token.icon}</span>
                        <div className="text-left">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {token.symbol}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            ${token.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount to Pay ({selectedToken.symbol})
                </label>
                <input
                  type="number"
                  placeholder={`Enter ${selectedToken.symbol} amount`}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="input-primary"
                  step="0.01"
                  min="0"
                />
              </div>

              {/* BAK Amount Display */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  BAK Tokens to Receive
                </label>
                <div className="input-primary bg-gray-50 dark:bg-gray-700">
                  {bakAmount || '0'} BAK
                </div>
              </div>

              {/* Purchase Summary */}
              {paymentAmount && bakAmount && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Purchase Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Payment:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {paymentAmount} {selectedToken.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">USD Value:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${(Number(paymentAmount) * selectedToken.price).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">BAK Tokens:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {bakAmount} BAK
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-300 dark:border-gray-600 pt-2">
                      <span className="text-gray-600 dark:text-gray-300">Price per BAK:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${EPO_CONFIG.PRICE_START} - ${EPO_CONFIG.PRICE_END}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Purchase Button */}
              <button
                onClick={handlePurchase}
                disabled={!paymentAmount || !bakAmount || purchasing}
                className={`btn-primary w-full text-lg py-4 ${
                  !paymentAmount || !bakAmount || purchasing
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {purchasing ? (
                  <>
                    <div className="spinner mr-2" />
                    Processing...
                  </>
                ) : (
                  `Purchase ${bakAmount || '0'} BAK`
                )}
              </button>
            </div>

            {/* EPO Information */}
            <div className="space-y-6">
              {/* Key Features */}
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  🌟 Key Features
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-brainark-500 mr-2">•</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      Bonding curve pricing from ${EPO_CONFIG.PRICE_START} to ${EPO_CONFIG.PRICE_END} per BAK token
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brainark-500 mr-2">•</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      Accept multiple payment tokens (ETH, USDT, USDC, BNB)
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brainark-500 mr-2">•</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      No time limits - always open
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brainark-500 mr-2">•</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      No KYC required
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brainark-500 mr-2">•</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      Instant token delivery
                    </span>
                  </li>
                </ul>
              </div>

              {/* Token Allocation */}
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  📊 Token Allocation
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">EPO Supply:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(EPO_CONFIG.TOTAL_SUPPLY)} BAK
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Tokens Sold:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(epoData.totalSold)} BAK
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Remaining:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(epoData.remainingSupply)} BAK
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-300 dark:border-gray-600 pt-3">
                    <span className="text-gray-600 dark:text-gray-300">Progress:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {((epoData.totalSold / EPO_CONFIG.TOTAL_SUPPLY) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="card bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3">
                  🔒 Security Notice
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                  <li>• Always verify the contract address before purchasing</li>
                  <li>• Never share your private keys or seed phrase</li>
                  <li>• Double-check transaction details before confirming</li>
                  <li>• Only use official BrainArk channels and websites</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}