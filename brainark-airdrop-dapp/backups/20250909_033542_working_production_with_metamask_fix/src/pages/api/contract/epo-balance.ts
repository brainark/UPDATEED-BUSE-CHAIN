import { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'

const EPO_ABI = [
  'function balanceOf(address owner) view returns (uint256)'
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.brainark.online'
    const epoAddress = '0xdE04886D4e89f48F73c1684f2e610b25D561DD48'
    
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const contract = new ethers.Contract(epoAddress, EPO_ABI, provider)
    
    const balance = await contract.balanceOf(epoAddress)
    const balanceFormatted = ethers.formatUnits(balance, 18) // BAK has 18 decimals
    
    res.status(200).json({
      success: true,
      contract: epoAddress,
      balance: balanceFormatted,
      balanceRaw: balance.toString(),
      rpcUrl
    })
  } catch (error: any) {
    console.error('Contract balance check failed:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      contract: process.env.NEXT_PUBLIC_EPO_CONTRACT,
      rpcUrl: process.env.NEXT_PUBLIC_RPC_URL
    })
  }
}