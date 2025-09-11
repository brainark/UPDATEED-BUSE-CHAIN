// Cross-Chain EPO Contract Hook with Oracle Integration
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { usePublicClient, useWalletClient, useSwitchChain } from 'wagmi'
import { parseAbi, formatEther, parseUnits } from 'viem'
import { mainnet, bsc, polygon } from 'viem/chains'
import { PAYMENT_TOKENS, getNetworkByChainId, switchToNetwork, getPaymentOptionByTokenAndNetwork } from '@/utils/multiNetworkConfig'
import { toast } from 'react-hot-toast'

interface CrossChainPayment {
  paymentToken: string
  paymentNetwork: string
  paymentAmount: string
  treasuryAddress: string
  expectedBAK: string
  chainId: number
}

interface PaymentStatus {
  txHash: string
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'failed'
  bakAmount?: string
  timestamp: number
}

export const useCrossChainEPOContract = (contractAddress?: string) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentStatus[]>([])
  
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { switchChain } = useSwitchChain()

  const epoAddress = useMemo(() => 
    (contractAddress || process.env.NEXT_PUBLIC_EPO_CONTRACT || '0xdE04886D4e89f48F73c1684f2e610b25D561DD48') as `0x${string}`,
    [contractAddress]
  )

  // ERC20 ABI for token transfers
  const ERC20_ABI = parseAbi([
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)'
  ])

  // Cross-chain BAK purchase with Oracle integration
  const purchaseBakCrossChain = useCallback(async (payment: CrossChainPayment): Promise<string> => {
    if (!walletClient || !walletClient.account) {
      throw new Error('Wallet not connected')
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get payment option configuration
      const paymentOption = getPaymentOptionByTokenAndNetwork(payment.paymentToken, payment.paymentNetwork)
      if (!paymentOption) {
        throw new Error(`Payment option not found for ${payment.paymentToken} on ${payment.paymentNetwork}`)
      }

      // Check if user is on correct network
      const currentChainId = await walletClient.getChainId()
      if (currentChainId !== payment.chainId) {
        toast.info(`Switching to ${paymentOption.network.name}...`)
        
        try {
          await switchChain({ chainId: payment.chainId })
          // Wait for network switch to complete
          await new Promise(resolve => setTimeout(resolve, 2000))
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            // Network not added to wallet, add it
            await switchToNetwork(paymentOption.network)
          } else {
            throw new Error(`Failed to switch network: ${switchError.message}`)
          }
        }
      }

      const treasuryAddress = paymentOption.treasuryAddress as `0x${string}`
      const paymentAmountFormatted = parseFloat(payment.paymentAmount)
      let txHash: string

      if (paymentOption.isNative) {
        // Native token payment (ETH, BNB, MATIC)
        const valueInWei = parseUnits(payment.paymentAmount, 18)
        
        txHash = await walletClient.sendTransaction({
          account: walletClient.account,
          to: treasuryAddress,
          value: valueInWei,
          gas: 100000n,
        })
        
        toast.success(`${payment.paymentToken} payment sent to treasury!`)

      } else {
        // ERC20 token payment (USDT, USDC)
        const tokenDecimals = paymentOption.token.decimals
        const tokenAmount = parseUnits(payment.paymentAmount, tokenDecimals)
        const tokenContract = paymentOption.token.contractAddress as `0x${string}`

        // Check token balance
        const balance = await publicClient!.readContract({
          address: tokenContract,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [walletClient.account.address]
        })

        if (balance < tokenAmount) {
          throw new Error(`Insufficient ${payment.paymentToken} balance`)
        }

        // Check allowance
        const allowance = await publicClient!.readContract({
          address: tokenContract,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [walletClient.account.address, treasuryAddress]
        })

        // Approve if needed
        if (allowance < tokenAmount) {
          toast.info('Approving token transfer...')
          
          const approveHash = await walletClient.writeContract({
            address: tokenContract,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [treasuryAddress, tokenAmount],
            account: walletClient.account,
          })
          
          toast.info('Waiting for approval confirmation...')
          // Wait for approval to be mined
          await new Promise(resolve => setTimeout(resolve, 15000))
        }

        // Execute token transfer
        txHash = await walletClient.writeContract({
          address: tokenContract,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [treasuryAddress, tokenAmount],
          account: walletClient.account,
        })

        toast.success(`${payment.paymentToken} tokens sent to treasury!`)
      }

      // Record payment for Oracle processing
      const paymentStatus: PaymentStatus = {
        txHash,
        status: 'pending',
        bakAmount: payment.expectedBAK,
        timestamp: Date.now()
      }

      setPaymentHistory(prev => [paymentStatus, ...prev])
      
      // Store payment details for Oracle verification
      const paymentDetails = {
        txHash,
        paymentToken: payment.paymentToken,
        paymentNetwork: payment.paymentNetwork,
        paymentAmount: payment.paymentAmount,
        treasuryAddress: payment.treasuryAddress,
        userAddress: walletClient.account.address,
        expectedBAK: payment.expectedBAK,
        timestamp: Date.now(),
        chainId: payment.chainId
      }
      
      // Store in localStorage for Oracle to pick up
      const existingPayments = JSON.parse(localStorage.getItem('pendingCrossChainPayments') || '[]')
      existingPayments.push(paymentDetails)
      localStorage.setItem('pendingCrossChainPayments', JSON.stringify(existingPayments))

      toast.success(
        `Payment submitted successfully!\nTx: ${txHash.slice(0, 10)}...\nExpected BAK: ${payment.expectedBAK}`,
        { duration: 8000 }
      )

      // Start monitoring payment status
      setTimeout(() => {
        monitorPaymentStatus(txHash)
      }, 5000)

      return txHash

    } catch (error: any) {
      console.error('Cross-chain payment failed:', error)
      setError(error.message || 'Payment failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [walletClient, publicClient, switchChain, epoAddress])

  // Monitor payment status (Oracle processing)
  const monitorPaymentStatus = useCallback(async (txHash: string) => {
    // Check if Oracle has processed the payment
    const checkPaymentStatus = async () => {
      try {
        const pendingPayments = JSON.parse(localStorage.getItem('pendingCrossChainPayments') || '[]')
        const completedPayments = JSON.parse(localStorage.getItem('completedCrossChainPayments') || '[]')
        
        const completedPayment = completedPayments.find((p: any) => p.txHash === txHash)
        if (completedPayment) {
          setPaymentHistory(prev => 
            prev.map(p => 
              p.txHash === txHash 
                ? { ...p, status: 'completed' as const }
                : p
            )
          )
          
          toast.success(
            `BAK tokens received!\nAmount: ${completedPayment.bakAmount} BAK`,
            { duration: 5000 }
          )
          
          return true
        }

        // Check if payment is being processed
        const pendingPayment = pendingPayments.find((p: any) => p.txHash === txHash)
        if (pendingPayment && Date.now() - pendingPayment.timestamp > 60000) { // 1 minute
          setPaymentHistory(prev => 
            prev.map(p => 
              p.txHash === txHash 
                ? { ...p, status: 'processing' as const }
                : p
            )
          )
        }

        return false
      } catch (error) {
        console.error('Error checking payment status:', error)
        return false
      }
    }

    // Poll payment status
    const maxAttempts = 20 // 10 minutes
    let attempts = 0
    
    const pollStatus = setInterval(async () => {
      attempts++
      const completed = await checkPaymentStatus()
      
      if (completed || attempts >= maxAttempts) {
        clearInterval(pollStatus)
        
        if (!completed && attempts >= maxAttempts) {
          setPaymentHistory(prev => 
            prev.map(p => 
              p.txHash === txHash 
                ? { ...p, status: 'processing' as const }
                : p
            )
          )
          
          toast.info(
            'Payment is being processed by Oracle. BAK tokens will arrive shortly.',
            { duration: 6000 }
          )
        }
      }
    }, 30000) // Check every 30 seconds

  }, [])

  // Calculate BAK amount for payment
  const calculateBAKAmount = useCallback((paymentAmount: string, tokenSymbol: string): string => {
    const tokenPrices: Record<string, number> = {
      ETH: 3420.75,
      BNB: 635.50,
      MATIC: 0.85,
      USDT: 1.00,
      USDC: 1.00
    }
    
    const tokenPrice = tokenPrices[tokenSymbol] || 1
    const bakPrice = 0.02 // $0.02 per BAK
    const usdValue = parseFloat(paymentAmount) * tokenPrice
    const bakAmount = usdValue / bakPrice
    
    return bakAmount.toFixed(2)
  }, [])

  // Get supported payment options
  const getSupportedPaymentOptions = useCallback(() => {
    return PAYMENT_TOKENS.map(token => ({
      symbol: token.symbol,
      name: token.name,
      network: token.network,
      chainId: token.chainId,
      treasuryAddress: token.treasuryAddress,
      isNative: token.contractAddress === '0x0000000000000000000000000000000000000000',
      icon: token.symbol === 'ETH' ? '💎' : 
            token.symbol === 'BNB' ? '🟡' : 
            token.symbol === 'MATIC' ? '🟣' :
            token.symbol === 'USDT' ? '💵' : '🔵'
    }))
  }, [])

  return {
    purchaseBakCrossChain,
    calculateBAKAmount,
    getSupportedPaymentOptions,
    paymentHistory,
    isLoading,
    error,
    contractAddress: epoAddress
  }
}