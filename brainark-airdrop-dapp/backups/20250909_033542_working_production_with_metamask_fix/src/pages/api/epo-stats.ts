import { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'

// EPO contract data with fallback
let epoStats = {
  totalSold: "0",
  totalRaised: "0.00",
  remainingSupply: "100000000",
  currentPrice: "0.02",
  contractBalance: "0.00",
  isActive: false,
  timeRemaining: null,
  lastUpdate: Date.now()
}

// Simulate EPO activity
function updateEPOStats() {
  const now = Date.now()
  const timeDiff = now - epoStats.lastUpdate
  
  // Update every 30 seconds
  if (timeDiff > 30000) {
    const randomSales = Math.floor(Math.random() * 1000) + 100
    const newTotalSold = parseFloat(epoStats.totalSold) + randomSales
    const newPrice = 0.02 + (newTotalSold / 100000000) * 0.48 // Bonding curve
    const newRaised = newTotalSold * newPrice
    
    epoStats = {
      ...epoStats,
      totalSold: newTotalSold.toString(),
      totalRaised: newRaised.toFixed(2),
      remainingSupply: (100000000 - newTotalSold).toString(),
      currentPrice: newPrice.toFixed(4),
      contractBalance: (100000000 - newTotalSold).toFixed(2),
      isActive: newTotalSold < 100000000,
      lastUpdate: now
    }
  }
}

async function fetchRealContractData() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)
    const contractAddress = process.env.NEXT_PUBLIC_EPO_CONTRACT
    
    if (!contractAddress) {
      throw new Error('EPO contract address not configured')
    }
    
    // Minimal ABI for stats
    const abi = [
      'function getContractStats() view returns (uint256 totalSold, uint256 totalRaised, uint256 remainingSupply, uint256 price, uint256 contractBalance)',
      'function currentPrice() view returns (uint256)',
      'function totalBakSold() view returns (uint256)',
      'function TOTAL_BAK_FOR_SALE() view returns (uint256)'
    ]
    
    const contract = new ethers.Contract(contractAddress, abi, provider)
    
    // Try to get contract stats
    const [totalSold, currentPrice, totalForSale] = await Promise.all([
      contract.totalBakSold().catch(() => ethers.parseEther("0")),
      contract.currentPrice().catch(() => ethers.parseUnits("0.02", 18)),
      contract.TOTAL_BAK_FOR_SALE().catch(() => ethers.parseEther("100000000"))
    ])
    
    const contractBalance = await provider.getBalance(contractAddress)
    const totalSoldEther = ethers.formatEther(totalSold)
    const currentPriceEther = ethers.formatEther(currentPrice)
    const totalForSaleEther = ethers.formatEther(totalForSale)
    const remainingSupply = (parseFloat(totalForSaleEther) - parseFloat(totalSoldEther)).toString()
    const totalRaised = (parseFloat(totalSoldEther) * parseFloat(currentPriceEther)).toFixed(2)
    
    return {
      totalSold: totalSoldEther,
      totalRaised,
      remainingSupply,
      currentPrice: currentPriceEther,
      contractBalance: ethers.formatEther(contractBalance),
      isActive: parseFloat(totalSoldEther) < parseFloat(totalForSaleEther),
      timeRemaining: null,
      contractFound: true
    }
  } catch (error) {
    console.error('Error fetching real contract data:', error)
    return null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Try to fetch real contract data first
    const realData = await fetchRealContractData()
    
    if (realData) {
      return res.status(200).json({ stats: realData })
    }
    
    // Fallback to simulated data
    updateEPOStats()
    
    const stats = {
      ...epoStats,
      contractFound: false,
      error: 'Using simulated data - contract connection failed'
    }
    
    res.status(200).json({ stats })
  } catch (error) {
    console.error('EPO stats API error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch EPO stats',
      stats: epoStats
    })
  }
}