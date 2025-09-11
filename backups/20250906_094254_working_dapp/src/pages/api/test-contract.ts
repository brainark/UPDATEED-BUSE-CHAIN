import { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.brainark.online'
    const epoAddress = '0xdE04886D4e89f48F73c1684f2e610b25D561DD48'
    const airdropAddress = '0x1Df35D8e45E0192cD3C25B007a5417b2235642E5'
    
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    
    // Check if contracts exist
    const [epoCode, airdropCode, epoBalance, airdropBalance] = await Promise.all([
      provider.getCode(epoAddress),
      provider.getCode(airdropAddress), 
      provider.getBalance(epoAddress),
      provider.getBalance(airdropAddress)
    ])
    
    res.status(200).json({
      success: true,
      rpcUrl,
      contracts: {
        epo: {
          address: epoAddress,
          exists: epoCode !== '0x',
          balance: ethers.formatEther(epoBalance),
          codeLength: epoCode.length
        },
        airdrop: {
          address: airdropAddress,
          exists: airdropCode !== '0x',
          balance: ethers.formatEther(airdropBalance),
          codeLength: airdropCode.length
        }
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Contract test failed:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}