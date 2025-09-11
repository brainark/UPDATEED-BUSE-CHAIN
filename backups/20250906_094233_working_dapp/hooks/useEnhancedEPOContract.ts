import { useState, useEffect, useCallback } from 'react'
import { usePublicClient, useWalletClient, useAccount, useChainId } from 'wagmi'
import { parseAbi, formatEther, parseEther, Address } from 'viem'
import { toast } from 'react-hot-toast'
import { getTreasuryAddressForNetwork } from '@/utils/enhancedWagmiConfig'

interface EPOContractStats {
  totalSold: string
  totalRaised: string
  remainingSupply: string
  price: string
  contractBalance: string
  isActive: boolean
  contractFound: boolean
}

interface TransactionResult {
  hash: string
  success: boolean
  error?: string
}

interface EPOContractData {
  stats: EPOContractStats | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  purchaseBAK: (paymentAmount: string, paymentToken: string, network: string) => Promise<TransactionResult>
  isTransactionPending: boolean
}

// Enhanced EPO contract ABI with all necessary functions
const ENHANCED_EPO_ABI = parseAbi([
  // View functions
  'function getContractStats() view returns (uint256 totalSold, uint256 totalRaised, uint256 remainingSupply, uint256 price, uint256 contractBalance)',
  'function currentPrice() view returns (uint256)',
  'function totalBakSold() view returns (uint256)',
  'function totalUSDRaised() view returns (uint256)',
  'function TOTAL_BAK_FOR_SALE() view returns (uint256)',
  'function paused() view returns (bool)',
  'function owner() view returns (address)',
  
  // Purchase functions
  'function purchaseTokens(address paymentTokenAddress, uint256 paymentAmount) payable',
  'function processCrossChainPurchase(address buyer, string memory sourceChain, string memory paymentToken, uint256 paymentAmount, string memory sourceTxHash) external',
  
  // Admin functions
  'function pause() external',
  'function unpause() external',
  'function emergencyWithdraw(address token, uint256 amount, address to) external',
  
  // Events
  'event TokenPurchase(address indexed buyer, address indexed paymentToken, uint256 paymentAmount, uint256 bakAmount, uint256 usdValue, address treasuryWallet, uint256 timestamp)',
  'event CrossChainPurchase(address indexed buyer, string indexed sourceNetwork, string paymentToken, uint256 paymentAmount, uint256 bakAmount, uint256 currentPrice, uint256 timestamp)',
])

// ERC20 ABI for token operations
const ERC20_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
])

export const useEnhancedEPOContract = (contractAddress?: string): EPOContractData => {
  const [data, setData] = useState<EPOContractData>({
    stats: null,
    isLoading: true,
    error: null,
    refetch: async () => {},
    purchaseBAK: async () => ({ hash: '', success: false }),
    isTransactionPending: false,
  })

  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { address: userAddress } = useAccount()
  const chainId = useChainId()

  // Use environment variable or provided address
  const epoAddress = (contractAddress || 
    process.env.NEXT_PUBLIC_EPO_CONTRACT || 
    '0xdE04886D4e89f48F73c1684f2e610b25D561DD48'
  ) as Address

  // Enhanced contract stats fetching with multiple fallbacks
  const fetchContractStats = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }))

      if (!publicClient) {
        throw new Error('No public client available')
      }

      // Check if contract exists
      const code = await publicClient.getBytecode({ address: epoAddress })
      if (!code || code === '0x') {
        console.warn('Contract not found, using API fallback')
        
        // Try API endpoint as fallback
        try {
          const response = await fetch('/api/epo-stats')
          if (response.ok) {
            const { stats } = await response.json()
            setData(prev => ({ 
              ...prev, 
              stats: {
                ...stats,
                contractFound: false,
              },
              isLoading: false,
              error: 'Using simulated data - contract not deployed'
            }))
            return
          }
        } catch (apiError) {
          console.error('API fallback failed:', apiError)
        }
        
        throw new Error('Contract not found and API unavailable')
      }

      // Try to call the main stats function
      try {
        const result = await publicClient.readContract({
          address: epoAddress,
          abi: ENHANCED_EPO_ABI,
          functionName: 'getContractStats',
        })

        const [totalSold, totalRaised, remainingSupply, price, contractBalance] = result as [bigint, bigint, bigint, bigint, bigint]

        // Check if contract is paused
        let isPaused = false
        try {
          isPaused = await publicClient.readContract({
            address: epoAddress,
            abi: ENHANCED_EPO_ABI,
            functionName: 'paused',
          }) as boolean
        } catch (pauseError) {
          console.warn('Could not check pause status:', pauseError)
        }

        const stats: EPOContractStats = {
          totalSold: formatEther(totalSold),
          totalRaised: formatEther(totalRaised),
          remainingSupply: formatEther(remainingSupply),
          price: formatEther(price),
          contractBalance: formatEther(contractBalance),
          isActive: !isPaused && remainingSupply > 0n,
          contractFound: true,
        }

        setData(prev => ({ ...prev, stats, isLoading: false, error: null }))

      } catch (contractError) {
        console.warn('Main contract call failed, trying individual calls:', contractError)

        // Fallback: try individual function calls
        try {
          const [currentPrice, totalBakSold, totalSupply, balance] = await Promise.all([
            publicClient.readContract({
              address: epoAddress,
              abi: ENHANCED_EPO_ABI,
              functionName: 'currentPrice',
            }).catch(() => parseEther('0.02')), // Default $0.02

            publicClient.readContract({
              address: epoAddress,
              abi: ENHANCED_EPO_ABI,
              functionName: 'totalBakSold',
            }).catch(() => 0n),

            publicClient.readContract({
              address: epoAddress,
              abi: ENHANCED_EPO_ABI,
              functionName: 'TOTAL_BAK_FOR_SALE',
            }).catch(() => parseEther('100000000')), // 100M BAK

            publicClient.getBalance({ address: epoAddress }),
          ])

          const remainingSupply = totalSupply - totalBakSold

          const stats: EPOContractStats = {
            totalSold: formatEther(totalBakSold),
            totalRaised: '0', // Can't calculate without payment history
            remainingSupply: formatEther(remainingSupply),
            price: formatEther(currentPrice),
            contractBalance: formatEther(balance),
            isActive: remainingSupply > 0n,
            contractFound: true,
          }

          setData(prev => ({ ...prev, stats, isLoading: false, error: null }))

        } catch (fallbackError) {
          console.error('All contract calls failed:', fallbackError)
          throw fallbackError
        }
      }

    } catch (error: any) {
      console.error('Error fetching EPO contract stats:', error)
      setData(prev => ({
        ...prev,
        error: error.message || 'Failed to fetch contract data',
        isLoading: false,
        stats: {
          totalSold: '0',
          totalRaised: '0',
          remainingSupply: '100000000',
          price: '0.02',
          contractBalance: '0',
          isActive: false,
          contractFound: false,
        }
      }))
    }
  }, [publicClient, epoAddress])

  // Enhanced purchase function with comprehensive error handling
  const purchaseBAK = useCallback(async (
    paymentAmount: string, 
    paymentToken: string, 
    network: string
  ): Promise<TransactionResult> => {
    if (!walletClient || !userAddress) {
      throw new Error('Wallet not connected')
    }

    if (!data.stats?.isActive) {
      throw new Error('EPO is not active')
    }

    setData(prev => ({ ...prev, isTransactionPending: true }))

    try {
      const amount = parseFloat(paymentAmount)
      if (amount <= 0) {
        throw new Error('Invalid payment amount')
      }

      // Get treasury address for the network and token
      const treasuryAddress = getTreasuryAddressForNetwork(network, paymentToken)
      if (!treasuryAddress) {
        throw new Error(`No treasury address configured for ${paymentToken} on ${network}`)
      }

      let txHash: string

      if (paymentToken === 'ETH' || paymentToken === 'BNB' || paymentToken === 'MATIC') {
        // Native token payment
        const weiAmount = parseEther(paymentAmount)
        
        // Direct payment to EPO contract
        txHash = await walletClient.sendTransaction({
          account: userAddress,
          to: epoAddress,
          value: weiAmount,
          gas: 300000n,
        })

      } else {
        // ERC20 token payment
        const tokenContracts: Record<string, Record<string, Address>> = {
          ethereum: {
            USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            USDC: '0xA0b86a33E6441e2e64ba2714d3079559c00c35dfd0',
          },
          bsc: {
            USDT: '0x55d398326f99059fF775485246999027B3197955',
            USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
          },
          polygon: {
            USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
            USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          },
        }

        const tokenAddress = tokenContracts[network]?.[paymentToken]
        if (!tokenAddress) {
          throw new Error(`Token contract not found for ${paymentToken} on ${network}`)
        }

        // Get token decimals
        const decimals = await publicClient!.readContract({
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: 'decimals',
        }) as number

        const tokenAmount = BigInt(amount * (10 ** decimals))

        // Check allowance
        const allowance = await publicClient!.readContract({
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [userAddress, epoAddress],
        }) as bigint

        // Approve if necessary
        if (allowance < tokenAmount) {
          const approveHash = await walletClient.writeContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [epoAddress, tokenAmount],
          })

          // Wait for approval
          await publicClient!.waitForTransactionReceipt({ hash: approveHash })
          toast.success('Token approval confirmed')
        }

        // Execute purchase
        txHash = await walletClient.writeContract({
          address: epoAddress,
          abi: ENHANCED_EPO_ABI,
          functionName: 'purchaseTokens',
          args: [tokenAddress, tokenAmount],
        })
      }

      // Wait for transaction confirmation
      const receipt = await publicClient!.waitForTransactionReceipt({ 
        hash: txHash,
        timeout: 60000, // 60 second timeout
      })

      if (receipt.status === 'success') {
        toast.success(
          `Purchase successful!\nTx: ${txHash.slice(0, 10)}...\nBAK tokens will be delivered shortly`,
          { duration: 8000 }
        )

        // Refresh contract stats after successful purchase
        setTimeout(() => {
          fetchContractStats()
        }, 3000)

        return { hash: txHash, success: true }
      } else {
        throw new Error('Transaction failed')
      }

    } catch (error: any) {
      console.error('Purchase failed:', error)
      
      let errorMessage = 'Purchase failed'
      if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction'
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction rejected by user'
      } else if (error.message.includes('gas')) {
        errorMessage = 'Transaction failed due to gas issues'
      } else if (error.message.includes('allowance')) {
        errorMessage = 'Token allowance error'
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
      return { hash: '', success: false, error: errorMessage }

    } finally {
      setData(prev => ({ ...prev, isTransactionPending: false }))
    }
  }, [walletClient, userAddress, data.stats?.isActive, epoAddress, publicClient, fetchContractStats])

  // Initialize data fetching
  useEffect(() => {
    fetchContractStats()
  }, [fetchContractStats])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchContractStats, 30000)
    return () => clearInterval(interval)
  }, [fetchContractStats])

  return {
    ...data,
    refetch: fetchContractStats,
    purchaseBAK,
    contractAddress: epoAddress,
  }
}