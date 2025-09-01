import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'

interface PaymentNetwork {
  chainId: number
  name: string
  rpcUrl: string
  nativeCurrency: { name: string; symbol: string; decimals: number }
  blockExplorer: string
  icon: string
}

interface PaymentToken {
  symbol: string
  name: string
  address: string
  decimals: number
  icon: string
  priceUSD: number
}

interface PaymentStep {
  id: number
  title: string
  description: string
  status: 'pending' | 'active' | 'completed' | 'error'
}

const PAYMENT_NETWORKS: PaymentNetwork[] = [
  {
    chainId: 1,
    name: 'Ethereum',
    rpcUrl: 'https://eth.llamarpc.com',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    blockExplorer: 'https://etherscan.io',
    icon: '🔷'
  },
  {
    chainId: 56,
    name: 'BSC',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    blockExplorer: 'https://bscscan.com',
    icon: '🟡'
  },
  {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    blockExplorer: 'https://polygonscan.com',
    icon: '🟣'
  }
]

const BRAINARK_NETWORK: PaymentNetwork = {
  chainId: 424242,
  name: 'BrainArk',
  rpcUrl: 'https://rpc.brainark.online',
  nativeCurrency: { name: 'BrainArk', symbol: 'BAK', decimals: 18 },
  blockExplorer: 'https://explorer.brainark.online',
  icon: '🧠'
}

const PAYMENT_TOKENS: Record<number, PaymentToken[]> = {
  1: [
    { symbol: 'ETH', name: 'Ethereum', address: 'native', decimals: 18, icon: '🔷', priceUSD: 2500 },
    { symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, icon: '🟢', priceUSD: 1 },
    { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86a33E6441d4ac8aB8C92bf96cF6b5c2f5fe5', decimals: 6, icon: '🔵', priceUSD: 1 }
  ],
  56: [
    { symbol: 'BNB', name: 'BNB', address: 'native', decimals: 18, icon: '🟡', priceUSD: 300 },
    { symbol: 'USDT', name: 'Tether USD', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18, icon: '🟢', priceUSD: 1 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18, icon: '🔵', priceUSD: 1 }
  ],
  137: [
    { symbol: 'MATIC', name: 'Polygon', address: 'native', decimals: 18, icon: '🟣', priceUSD: 0.8 },
    { symbol: 'USDT', name: 'Tether USD', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6, icon: '🟢', priceUSD: 1 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6, icon: '🔵', priceUSD: 1 }
  ]
}

const BAK_PRICE_USD = 0.02
const TREASURY_ADDRESS = '0x742d35Cc6634C0532925a3b8D0C9bd0D8f05B89C' // Your treasury wallet

export default function EnhancedCrossChainEPO() {
  const [currentChain, setCurrentChain] = useState<number | null>(null)
  const [selectedNetwork, setSelectedNetwork] = useState<PaymentNetwork | null>(null)
  const [selectedToken, setSelectedToken] = useState<PaymentToken | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [bakAmount, setBakAmount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [userAddress, setUserAddress] = useState('')
  const [steps, setSteps] = useState<PaymentStep[]>([
    { id: 1, title: 'Choose Payment Method', description: 'Select network and token', status: 'active' },
    { id: 2, title: 'Make Payment', description: 'Send payment to treasury', status: 'pending' },
    { id: 3, title: 'Switch to BrainArk', description: 'Connect to BrainArk network', status: 'pending' },
    { id: 4, title: 'Receive BAK Tokens', description: 'Get your BAK tokens', status: 'pending' }
  ])
  const [txHash, setTxHash] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    checkConnection()
    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleChainChanged)
      window.ethereum.on('accountsChanged', handleAccountsChanged)
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', handleChainChanged)
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  useEffect(() => {
    if (paymentAmount && selectedToken) {
      const amount = parseFloat(paymentAmount)
      if (amount > 0) {
        const usdValue = amount * selectedToken.priceUSD
        setBakAmount(usdValue / BAK_PRICE_USD)
      } else {
        setBakAmount(0)
      }
    }
  }, [paymentAmount, selectedToken])

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })
        
        if (accounts.length > 0) {
          setIsConnected(true)
          setUserAddress(accounts[0])
          setCurrentChain(parseInt(chainId, 16))
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    }
  }

  const handleChainChanged = (chainId: string) => {
    setCurrentChain(parseInt(chainId, 16))
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setUserAddress(accounts[0])
      setIsConnected(true)
    } else {
      setIsConnected(false)
      setUserAddress('')
    }
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!')
      return
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setIsConnected(true)
      setUserAddress(accounts[0])
      
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      setCurrentChain(parseInt(chainId, 16))
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  const switchToNetwork = async (network: PaymentNetwork) => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${network.chainId.toString(16)}` }]
      })
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${network.chainId.toString(16)}`,
              chainName: network.name,
              nativeCurrency: network.nativeCurrency,
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: [network.blockExplorer]
            }]
          })
        } catch (addError) {
          console.error('Error adding network:', addError)
          throw addError
        }
      } else {
        throw switchError
      }
    }
  }

  const updateStepStatus = (stepId: number, status: PaymentStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ))
  }

  const makePayment = async () => {
    if (!selectedToken || !selectedNetwork || !paymentAmount) return

    setIsProcessing(true)
    updateStepStatus(2, 'active')

    try {
      // Step 1: Switch to payment network if needed
      if (currentChain !== selectedNetwork.chainId) {
        await switchToNetwork(selectedNetwork)
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const amount = ethers.parseUnits(paymentAmount, selectedToken.decimals)

      let tx

      if (selectedToken.address === 'native') {
        // Native token payment
        tx = await signer.sendTransaction({
          to: TREASURY_ADDRESS,
          value: amount
        })
      } else {
        // ERC20 token payment
        const tokenContract = new ethers.Contract(
          selectedToken.address,
          [
            'function transfer(address to, uint256 amount) returns (bool)',
            'function balanceOf(address owner) view returns (uint256)',
            'function approve(address spender, uint256 amount) returns (bool)'
          ],
          signer
        )

        // Check balance
        const balance = await tokenContract.balanceOf(userAddress)
        if (balance < amount) {
          throw new Error(`Insufficient ${selectedToken.symbol} balance`)
        }

        // Transfer tokens
        tx = await tokenContract.transfer(TREASURY_ADDRESS, amount)
      }

      await tx.wait()
      setTxHash(tx.hash)
      
      updateStepStatus(2, 'completed')
      updateStepStatus(3, 'active')

      // Step 2: Switch to BrainArk network
      await switchToNetwork(BRAINARK_NETWORK)
      updateStepStatus(3, 'completed')
      updateStepStatus(4, 'active')

      // Step 3: Trigger BAK distribution (this would call your oracle or backend)
      await distributeBakTokens()
      updateStepStatus(4, 'completed')

    } catch (error: any) {
      console.error('Payment error:', error)
      updateStepStatus(2, 'error')
      alert(`Payment failed: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const distributeBakTokens = async () => {
    // This function calls your backend API to process the cross-chain purchase
    try {
      const response = await fetch('/api/process-cross-chain-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          buyer: userAddress,
          sourceChain: selectedNetwork?.name.toLowerCase(),
          paymentToken: selectedToken?.symbol,
          paymentAmount: paymentAmount,
          bakAmount: bakAmount,
          sourceTxHash: txHash
        })
      })

      if (!response.ok) {
        throw new Error('Failed to process BAK distribution')
      }

      const result = await response.json()
      console.log('BAK distribution processed:', result)
    } catch (error) {
      console.error('BAK distribution error:', error)
      throw error
    }
  }

  const resetForm = () => {
    setSelectedNetwork(null)
    setSelectedToken(null)
    setPaymentAmount('')
    setBakAmount(0)
    setTxHash('')
    setSteps([
      { id: 1, title: 'Choose Payment Method', description: 'Select network and token', status: 'active' },
      { id: 2, title: 'Make Payment', description: 'Send payment to treasury', status: 'pending' },
      { id: 3, title: 'Switch to BrainArk', description: 'Connect to BrainArk network', status: 'pending' },
      { id: 4, title: 'Receive BAK Tokens', description: 'Get your BAK tokens', status: 'pending' }
    ])
  }

  const handleNetworkSelect = (network: PaymentNetwork) => {
    setSelectedNetwork(network)
    setSelectedToken(null)
    updateStepStatus(1, 'completed')
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🧠 BrainArk Token Sale - Cross-Chain EPO
        </h1>
        <p className="text-xl text-gray-600">
          Buy BAK tokens using your preferred cryptocurrency from any supported network
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Wallet Connection</h2>
            {isConnected ? (
              <div className="flex items-center mt-2">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-600">
                  Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                </span>
                {currentChain && (
                  <span className="ml-4 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    Chain: {currentChain}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center mt-2">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-red-600">Not Connected</span>
              </div>
            )}
          </div>
          {!isConnected && (
            <button
              onClick={connectWallet}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Purchase Progress</h2>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  step.status === 'completed' ? 'bg-green-500' :
                  step.status === 'active' ? 'bg-blue-500' :
                  step.status === 'error' ? 'bg-red-500' :
                  'bg-gray-300'
                }`}>
                  {step.status === 'completed' ? '✓' : step.id}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 ${
                  steps[index + 1].status === 'completed' || steps[index + 1].status === 'active' 
                    ? 'bg-blue-500' : 'bg-gray-300'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isConnected && (
        <>
          {/* Network Selection */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">1. Choose Payment Network</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PAYMENT_NETWORKS.map((network) => (
                <button
                  key={network.chainId}
                  onClick={() => handleNetworkSelect(network)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedNetwork?.chainId === network.chainId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{network.icon}</div>
                  <div className="font-semibold">{network.name}</div>
                  <div className="text-sm text-gray-500">Chain ID: {network.chainId}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Token Selection */}
          {selectedNetwork && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">2. Choose Payment Token</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PAYMENT_TOKENS[selectedNetwork.chainId]?.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => setSelectedToken(token)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedToken?.symbol === token.symbol
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{token.icon}</div>
                    <div className="font-semibold">{token.symbol}</div>
                    <div className="text-sm text-gray-500">{token.name}</div>
                    <div className="text-sm text-green-600">${token.priceUSD}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payment Form */}
          {selectedToken && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">3. Enter Payment Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount ({selectedToken.symbol})
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={`Enter ${selectedToken.symbol} amount`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    step="any"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BAK Tokens You'll Receive
                  </label>
                  <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">
                      {bakAmount.toFixed(2)} BAK
                    </div>
                    <div className="text-sm text-green-600">
                      ≈ ${(bakAmount * BAK_PRICE_USD).toFixed(2)} USD
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">🔄 Payment Process:</h3>
                <ol className="list-decimal list-inside space-y-1 text-yellow-700 text-sm">
                  <li>Pay with {selectedToken.symbol} on {selectedNetwork.name}</li>
                  <li>Automatically switch to BrainArk network</li>
                  <li>Receive BAK tokens in your wallet</li>
                  <li>Start building on BrainArk immediately!</li>
                </ol>
              </div>

              <button
                onClick={makePayment}
                disabled={isProcessing || !paymentAmount || parseFloat(paymentAmount) <= 0}
                className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isProcessing 
                  ? '⏳ Processing...' 
                  : `🚀 Buy ${bakAmount.toFixed(2)} BAK for ${paymentAmount || '0'} ${selectedToken.symbol}`
                }
              </button>
            </div>
          )}

          {/* Success/Reset */}
          {steps.every(step => step.status === 'completed') && (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Purchase Successful!
              </h2>
              <p className="text-gray-600 mb-4">
                You've successfully purchased {bakAmount.toFixed(2)} BAK tokens!
              </p>
              {txHash && (
                <p className="text-sm text-gray-500 mb-4">
                  Transaction: {txHash.slice(0, 10)}...{txHash.slice(-10)}
                </p>
              )}
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Make Another Purchase
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}