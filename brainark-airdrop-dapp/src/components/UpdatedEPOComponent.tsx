import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { 
  PAYMENT_OPTIONS, 
  PaymentOption, 
  calculateBAKAmount,
  calculateUSDValue,
  switchToNetwork,
  getCurrentNetwork,
  validateNetworkForToken,
  getBrainArkNetwork,
  getAllTreasuryAddresses
} from '../utils/multiNetworkConfig'

interface EPOState {
  selectedOption: PaymentOption | null
  paymentAmount: string
  bakAmount: number
  usdValue: number
  isProcessing: boolean
  currentNetwork: number | null
  isCorrectNetwork: boolean
  transactionHash: string | null
  error: string | null
}

const UpdatedEPOComponent: React.FC = () => {
  const [state, setState] = useState<EPOState>({
    selectedOption: null,
    paymentAmount: '',
    bakAmount: 0,
    usdValue: 0,
    isProcessing: false,
    currentNetwork: null,
    isCorrectNetwork: false,
    transactionHash: null,
    error: null
  })

  // Group payment options by network for better UI
  const paymentsByNetwork = PAYMENT_OPTIONS.reduce((acc, option) => {
    const networkName = option.network.name
    if (!acc[networkName]) {
      acc[networkName] = []
    }
    acc[networkName].push(option)
    return acc
  }, {} as Record<string, PaymentOption[]>)

  // Check current network on component mount and when network changes
  useEffect(() => {
    const checkNetwork = async () => {
      const currentChainId = await getCurrentNetwork()
      setState(prev => ({ ...prev, currentNetwork: currentChainId }))
      
      if (state.selectedOption && currentChainId) {
        const isCorrect = currentChainId === state.selectedOption.token.chainId
        setState(prev => ({ ...prev, isCorrectNetwork: isCorrect }))
      }
    }

    checkNetwork()

    // Listen for network changes
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleChainChanged = () => {
        checkNetwork()
      }
      
      window.ethereum.on('chainChanged', handleChainChanged)
      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [state.selectedOption])

  // Calculate BAK amount when payment amount or token changes
  useEffect(() => {
    if (state.selectedOption && state.paymentAmount) {
      const amount = parseFloat(state.paymentAmount)
      if (!isNaN(amount) && amount > 0) {
        const bakAmount = calculateBAKAmount(amount, state.selectedOption.token.symbol)
        const usdValue = calculateUSDValue(amount, state.selectedOption.token.symbol)
        setState(prev => ({ ...prev, bakAmount, usdValue }))
      } else {
        setState(prev => ({ ...prev, bakAmount: 0, usdValue: 0 }))
      }
    }
  }, [state.selectedOption, state.paymentAmount])

  const handleTokenSelect = async (option: PaymentOption) => {
    setState(prev => ({ 
      ...prev, 
      selectedOption: option,
      paymentAmount: '',
      bakAmount: 0,
      usdValue: 0,
      error: null,
      transactionHash: null
    }))

    // Check if user is on correct network
    const isCorrect = await validateNetworkForToken(option.token)
    setState(prev => ({ ...prev, isCorrectNetwork: isCorrect }))
  }

  const handleNetworkSwitch = async () => {
    if (!state.selectedOption) return

    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }))
      await switchToNetwork(state.selectedOption.network)
      setState(prev => ({ ...prev, isCorrectNetwork: true }))
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }))
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }))
    }
  }

  const handlePayment = async () => {
    if (!state.selectedOption || !state.paymentAmount || !window.ethereum) {
      return
    }

    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }))

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const amount = ethers.parseUnits(state.paymentAmount, state.selectedOption.token.decimals)

      let txHash: string

      if (state.selectedOption.isNative) {
        // Native token transfer (ETH, BNB, MATIC)
        const tx = await signer.sendTransaction({
          to: state.selectedOption.treasuryAddress,
          value: amount,
          gasLimit: 21000
        })
        await tx.wait()
        txHash = tx.hash
      } else {
        // ERC20 token transfer (USDT, USDC)
        const tokenContract = new ethers.Contract(
          state.selectedOption.token.contractAddress,
          [
            'function transfer(address to, uint256 amount) returns (bool)',
            'function decimals() view returns (uint8)',
            'function balanceOf(address owner) view returns (uint256)'
          ],
          signer
        )

        const tx = await tokenContract.transfer(state.selectedOption.treasuryAddress, amount)
        await tx.wait()
        txHash = tx.hash
      }

      setState(prev => ({
        ...prev,
        transactionHash: txHash,
        paymentAmount: '',
        bakAmount: 0,
        usdValue: 0
      }))

      // Here you would typically trigger BAK distribution on BrainArk network
      // This could be done through a backend service or manual process

    } catch (error: any) {
      console.error('Payment error:', error)
      setState(prev => ({ ...prev, error: error.message || 'Payment failed' }))
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }))
    }
  }

  const getNetworkIcon = (networkName: string): string => {
    switch (networkName) {
      case 'Ethereum Mainnet': return '🔷'
      case 'BSC Mainnet': return '🟡'
      case 'Polygon Mainnet': return '🟣'
      default: return '🌐'
    }
  }

  const getExplorerUrl = (txHash: string, networkName: string): string => {
    switch (networkName) {
      case 'Ethereum Mainnet': return `https://etherscan.io/tx/${txHash}`
      case 'BSC Mainnet': return `https://bscscan.com/tx/${txHash}`
      case 'Polygon Mainnet': return `https://polygonscan.com/tx/${txHash}`
      default: return '#'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🚀 BrainArk EPO - Multi-Network Payment
        </h1>
        <p className="text-gray-600 text-lg">
          Buy BAK tokens at $0.02 each using your preferred cryptocurrency on its native network
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 font-semibold">
            💡 Pay with ETH, BNB, MATIC, USDT, or USDC on their respective networks
          </p>
          <p className="text-blue-600 text-sm mt-1">
            BAK tokens will be distributed on BrainArk Network after payment confirmation
          </p>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg">
          <p className="text-red-800 font-medium">❌ Error: {state.error}</p>
        </div>
      )}

      {/* Success Display */}
      {state.transactionHash && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg">
          <p className="text-green-800 font-medium">✅ Payment Successful!</p>
          <p className="text-green-700 text-sm mt-1">
            Transaction: 
            <a 
              href={getExplorerUrl(state.transactionHash, state.selectedOption?.network.name || '')}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 underline hover:text-green-900"
            >
              {state.transactionHash.slice(0, 10)}...{state.transactionHash.slice(-8)}
            </a>
          </p>
          <p className="text-green-700 text-sm">
            BAK tokens will be distributed to your wallet on BrainArk Network shortly.
          </p>
        </div>
      )}

      {/* Network and Token Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {Object.entries(paymentsByNetwork).map(([networkName, options]) => (
          <div key={networkName} className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              {getNetworkIcon(networkName)} {networkName}
            </h3>
            <div className="space-y-2">
              {options.map((option) => (
                <button
                  key={`${option.token.symbol}-${option.token.network}`}
                  onClick={() => handleTokenSelect(option)}
                  className={`w-full p-3 rounded-lg border-2 transition-all ${
                    state.selectedOption?.token.symbol === option.token.symbol &&
                    state.selectedOption?.token.network === option.token.network
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{option.token.icon}</span>
                      <div className="text-left">
                        <div className="font-semibold">{option.token.symbol}</div>
                        <div className="text-sm text-gray-500">{option.token.name}</div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Payment Form */}
      {state.selectedOption && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">
            Payment Details - {state.selectedOption.token.symbol} on {state.selectedOption.network.name}
          </h3>

          {/* Network Status */}
          {!state.isCorrectNetwork && (
            <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-800 font-medium">
                    ⚠️ Wrong Network
                  </p>
                  <p className="text-yellow-700 text-sm">
                    Please switch to {state.selectedOption.network.name} to continue
                  </p>
                </div>
                <button
                  onClick={handleNetworkSwitch}
                  disabled={state.isProcessing}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                  {state.isProcessing ? 'Switching...' : 'Switch Network'}
                </button>
              </div>
            </div>
          )}

          {/* Payment Amount Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount ({state.selectedOption.token.symbol})
              </label>
              <input
                type="number"
                value={state.paymentAmount}
                onChange={(e) => setState(prev => ({ ...prev, paymentAmount: e.target.value }))}
                placeholder={`Enter ${state.selectedOption.token.symbol} amount`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                step="any"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                You will receive (BAK)
              </label>
              <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {state.bakAmount.toFixed(2)} BAK
                </div>
                <div className="text-sm text-green-600">
                  ≈ ${state.usdValue.toFixed(2)} USD
                </div>
              </div>
            </div>
          </div>

          {/* Treasury Address Display */}
          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Treasury Address:</strong> {state.selectedOption.treasuryAddress}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Your payment will be sent to this verified treasury address
            </p>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={
              state.isProcessing || 
              !state.isCorrectNetwork || 
              !state.paymentAmount || 
              parseFloat(state.paymentAmount) <= 0
            }
            className="w-full mt-6 px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {state.isProcessing 
              ? '⏳ Processing Payment...' 
              : `🛒 Pay ${state.paymentAmount || '0'} ${state.selectedOption.token.symbol} for ${state.bakAmount.toFixed(2)} BAK`
            }
          </button>
        </div>
      )}

      {/* Treasury Information */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          📋 Multi-Network Treasury System
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-blue-800">
          <div>
            <h4 className="font-semibold mb-2">🔷 Ethereum Mainnet</h4>
            <ul className="text-sm space-y-1">
              <li>• ETH payments</li>
              <li>• USDT (ERC20)</li>
              <li>• USDC (ERC20)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">🟡 BSC Mainnet</h4>
            <ul className="text-sm space-y-1">
              <li>• BNB payments</li>
              <li>• USDT (BEP20)</li>
              <li>• USDC (BEP20)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">🟣 Polygon Mainnet</h4>
            <ul className="text-sm space-y-1">
              <li>• MATIC payments</li>
              <li>• USDT (Polygon)</li>
              <li>• USDC (Polygon)</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-blue-900 font-medium">
            🌟 BAK Distribution: All BAK tokens are distributed on BrainArk Network (Chain ID: 424242)
          </p>
        </div>
      </div>
    </div>
  )
}

export default UpdatedEPOComponent