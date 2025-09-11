import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useOptimizedPerformance, useDebouncedState } from './useOptimizedPerformance'

// Production-ready EPO contract hook with error handling
export const useProductionEPOContract = () => {
  const [contractStats, setContractStats] = useDebouncedState({
    totalSupply: '1000000000',
    totalSold: '0',
    currentPrice: '0.02',
    nextPhasePrice: '0.025',
    isActive: true,
    progress: 0,
    remainingTokens: '1000000000'
  }, 1000)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { delays, createOptimizedInterval, isProductionMode } = useOptimizedPerformance()

  // Contract configuration with fallback
  const contractConfig = {
    address: process.env.NEXT_PUBLIC_EPO_CONTRACT || '0xdE04886D4e89f48F73c1684f2e610b25D561DD48',
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.brainark.online',
    chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '424242')
  }

  // Optimized contract stats fetching with error handling
  const fetchContractStats = useCallback(async () => {
    if (loading) return // Prevent concurrent requests

    try {
      setLoading(true)
      setError(null)

      // Create provider with fallback
      const provider = new ethers.JsonRpcProvider(contractConfig.rpcUrl)
      
      // Check if contract exists (basic validation)
      const code = await provider.getCode(contractConfig.address)
      if (code === '0x') {
        // Contract doesn't exist, use fallback data
        console.warn('EPO contract not found, using fallback data')
        setContractStats(prev => ({
          ...prev,
          isActive: false
        }))
        return
      }

      // Contract ABI (minimal for stats)
      const contractABI = [
        'function totalSupply() view returns (uint256)',
        'function totalSold() view returns (uint256)',
        'function currentPrice() view returns (uint256)',
        'function isActive() view returns (bool)',
        'function balanceOf(address) view returns (uint256)'
      ]

      const contract = new ethers.Contract(contractConfig.address, contractABI, provider)

      // Fetch stats with timeout
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Contract call timeout')), 10000)
      )

      const statsPromise = Promise.all([
        contract.totalSupply().catch(() => ethers.parseEther('1000000000')),
        contract.totalSold().catch(() => ethers.parseEther('0')),
        contract.currentPrice().catch(() => ethers.parseEther('0.02')),
        contract.isActive().catch(() => true)
      ])

      const [totalSupply, totalSold, currentPrice, isActive] = await Promise.race([statsPromise, timeout]) as any[]

      // Calculate derived values
      const totalSupplyFormatted = ethers.formatEther(totalSupply)
      const totalSoldFormatted = ethers.formatEther(totalSold)
      const currentPriceFormatted = ethers.formatEther(currentPrice)
      const progress = (parseFloat(totalSoldFormatted) / parseFloat(totalSupplyFormatted)) * 100
      const remainingTokens = (parseFloat(totalSupplyFormatted) - parseFloat(totalSoldFormatted)).toFixed(2)

      setContractStats({
        totalSupply: totalSupplyFormatted,
        totalSold: totalSoldFormatted,
        currentPrice: currentPriceFormatted,
        nextPhasePrice: (parseFloat(currentPriceFormatted) * 1.25).toFixed(3),
        isActive,
        progress: Math.min(progress, 100),
        remainingTokens
      })

    } catch (error: any) {
      console.error('Error fetching EPO stats:', error.message)
      setError(error.message)
      
      // Use fallback data on error
      if (!contractStats.totalSupply) {
        setContractStats({
          totalSupply: '1000000000',
          totalSold: '125000000',
          currentPrice: '0.02',
          nextPhasePrice: '0.025',
          isActive: true,
          progress: 12.5,
          remainingTokens: '875000000'
        })
      }
    } finally {
      setLoading(false)
    }
  }, [loading, contractConfig, contractStats.totalSupply])

  // Purchase function with enhanced error handling
  const purchaseBAK = useCallback(async (amountInETH: string, userAddress: string) => {
    try {
      setLoading(true)
      setError(null)

      if (!window.ethereum) {
        throw new Error('MetaMask not found')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // Validate network
      const network = await provider.getNetwork()
      if (Number(network.chainId) !== contractConfig.chainId) {
        throw new Error(`Please switch to BrainArk network (Chain ID: ${contractConfig.chainId})`)
      }

      const contractABI = [
        'function purchaseTokens() payable',
        'function calculateTokenAmount(uint256 ethAmount) view returns (uint256)'
      ]

      const contract = new ethers.Contract(contractConfig.address, contractABI, signer)
      
      // Calculate gas with buffer
      const gasEstimate = await contract.purchaseTokens.estimateGas({
        value: ethers.parseEther(amountInETH)
      })

      const gasLimit = gasEstimate * 120n / 100n // 20% buffer

      // Execute transaction
      const tx = await contract.purchaseTokens({
        value: ethers.parseEther(amountInETH),
        gasLimit
      })

      console.log('Transaction sent:', tx.hash)
      
      // Wait for confirmation
      const receipt = await tx.wait()
      console.log('Transaction confirmed:', receipt.hash)

      // Refresh stats after successful purchase
      setTimeout(fetchContractStats, 2000)

      return receipt

    } catch (error: any) {
      console.error('Purchase failed:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [contractConfig, fetchContractStats])

  // Initialize and set up polling
  useEffect(() => {
    fetchContractStats()

    // Set up optimized polling based on environment
    const interval = createOptimizedInterval(
      fetchContractStats,
      delays.contractStats,
      false
    )

    return () => {
      clearInterval(interval)
    }
  }, [fetchContractStats, delays.contractStats, createOptimizedInterval])

  return {
    contractStats,
    loading,
    error,
    purchaseBAK,
    refetchStats: fetchContractStats,
    isProductionMode,
    contractAddress: contractConfig.address
  }
}