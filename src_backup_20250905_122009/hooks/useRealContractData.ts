import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'

interface ContractStats {
  contractBalance: string
  totalSold: string
  totalRaised: string
  remainingSupply: string
  price: string
  isActive: boolean
}

export const useRealContractData = () => {
  const [stats, setStats] = useState<ContractStats>({
    contractBalance: '0',
    totalSold: '0', 
    totalRaised: '0',
    remainingSupply: '100000000',
    price: '0.02',
    isActive: true
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const epoAddress = '0xdE04886D4e89f48F73c1684f2e610b25D561DD48'
  const airdropAddress = '0x1Df35D8e45E0192cD3C25B007a5417b2235642E5'

  const fetchRealContractData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const provider = new ethers.JsonRpcProvider('https://rpc.brainark.online')
      
      // Get actual contract balances
      const [epoBalance, airdropBalance] = await Promise.all([
        provider.getBalance(epoAddress),
        provider.getBalance(airdropAddress)
      ])

      // Convert to readable format
      const epoBalanceFormatted = ethers.formatEther(epoBalance)
      const airdropBalanceFormatted = ethers.formatEther(airdropBalance)
      
      // Calculate stats based on real funded amounts
      const totalSupply = 100000000 // 100M BAK for EPO
      const contractBalanceNum = parseFloat(epoBalanceFormatted)
      const soldAmount = Math.max(0, totalSupply - contractBalanceNum)
      const remainingSupply = Math.max(0, contractBalanceNum)
      
      // Estimate total raised (assume average price of $0.03)
      const estimatedTotalRaised = soldAmount * 0.03

      const newStats: ContractStats = {
        contractBalance: epoBalanceFormatted,
        totalSold: soldAmount.toFixed(0),
        totalRaised: estimatedTotalRaised.toFixed(2),
        remainingSupply: remainingSupply.toFixed(0),
        price: '0.02', // Current price
        isActive: contractBalanceNum > 0
      }

      setStats(newStats)
      setError(null)
      
      console.log('Real contract data loaded:', {
        epoBalance: epoBalanceFormatted,
        airdropBalance: airdropBalanceFormatted,
        stats: newStats
      })

    } catch (err: any) {
      console.error('Failed to fetch real contract data:', err)
      setError(err.message)
      
      // Use known funded amounts as fallback
      setStats({
        contractBalance: '100000000',
        totalSold: '0',
        totalRaised: '0',
        remainingSupply: '100000000', 
        price: '0.02',
        isActive: true
      })
    } finally {
      setIsLoading(false)
    }
  }, [epoAddress, airdropAddress])

  useEffect(() => {
    fetchRealContractData()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchRealContractData, 30000)
    return () => clearInterval(interval)
  }, [fetchRealContractData])

  return {
    stats,
    isLoading,
    error,
    refetch: fetchRealContractData,
    contractAddress: epoAddress
  }
}