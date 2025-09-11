import { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const epoAddress = process.env.NEXT_PUBLIC_EPO_CONTRACT || '0xdE04886D4e89f48F73c1684f2e610b25D561DD48'
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.brainark.online'

  try {
    console.log('Testing EPO contract connection...')
    console.log('EPO Address:', epoAddress)
    console.log('RPC URL:', rpcUrl)

    const provider = new ethers.JsonRpcProvider(rpcUrl)
    
    // Test basic connectivity
    const blockNumber = await provider.getBlockNumber()
    console.log('Current block number:', blockNumber)

    // Check if contract exists
    const code = await provider.getCode(epoAddress)
    const contractExists = code !== '0x'
    console.log('Contract exists:', contractExists)
    console.log('Contract code length:', code.length)

    // Get contract balance
    const balance = await provider.getBalance(epoAddress)
    const balanceFormatted = ethers.formatEther(balance)
    console.log('Contract balance:', balanceFormatted, 'BAK')

    // Try to call contract functions if it exists
    let contractStats = null
    if (contractExists) {
      try {
        // Simple ABI for basic functions
        const abi = [
          'function totalBakSold() view returns (uint256)',
          'function currentPrice() view returns (uint256)',
          'function TOTAL_BAK_FOR_SALE() view returns (uint256)',
          'function paused() view returns (bool)',
          'function owner() view returns (address)'
        ]

        const contract = new ethers.Contract(epoAddress, abi, provider)

        // Try different function calls
        const results = await Promise.allSettled([
          contract.totalBakSold(),
          contract.currentPrice(),
          contract.TOTAL_BAK_FOR_SALE(),
          contract.paused(),
          contract.owner()
        ])

        contractStats = {
          totalBakSold: results[0].status === 'fulfilled' ? ethers.formatEther(results[0].value) : 'N/A',
          currentPrice: results[1].status === 'fulfilled' ? ethers.formatEther(results[1].value) : 'N/A',
          totalSupply: results[2].status === 'fulfilled' ? ethers.formatEther(results[2].value) : 'N/A',
          paused: results[3].status === 'fulfilled' ? results[3].value : 'N/A',
          owner: results[4].status === 'fulfilled' ? results[4].value : 'N/A'
        }

        console.log('Contract stats:', contractStats)
      } catch (contractError) {
        console.error('Contract function calls failed:', contractError)
        contractStats = { error: contractError.message }
      }
    }

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      network: {
        rpcUrl,
        blockNumber,
        chainId: await provider.getNetwork().then(n => n.chainId.toString()).catch(() => 'unknown')
      },
      contract: {
        address: epoAddress,
        exists: contractExists,
        codeLength: code.length,
        balance: balanceFormatted,
        stats: contractStats
      }
    }

    console.log('EPO connection test completed successfully')
    res.status(200).json(response)

  } catch (error: any) {
    console.error('EPO connection test failed:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      config: {
        epoAddress,
        rpcUrl: rpcUrl.replace(/\/\/.*@/, '//***@') // Hide credentials in response
      }
    })
  }
}