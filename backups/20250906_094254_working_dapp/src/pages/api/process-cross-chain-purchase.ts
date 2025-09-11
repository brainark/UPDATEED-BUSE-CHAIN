import { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'

// This would be your actual cross-chain contract ABI
const CROSS_CHAIN_EPO_ABI = [
  'function processCrossChainPurchase(address buyer, string memory sourceChain, string memory paymentToken, uint256 paymentAmount, string memory sourceTxHash) external',
  'function isTransactionProcessed(string memory txHash) external view returns (bool)',
  'function getStats() external view returns (uint256 totalSold, uint256 totalRaised, uint256 remainingSupply, uint256 contractBalance)'
]

const BRAINARK_RPC = 'https://rpc.brainark.online'
const CROSS_CHAIN_EPO_ADDRESS = process.env.CROSS_CHAIN_EPO_ADDRESS || '0x...' // Your deployed contract address
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY || '' // Oracle wallet private key

interface CrossChainPurchaseRequest {
  buyer: string
  sourceChain: string
  paymentToken: string
  paymentAmount: string
  bakAmount: number
  sourceTxHash: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      buyer,
      sourceChain,
      paymentToken,
      paymentAmount,
      sourceTxHash
    }: CrossChainPurchaseRequest = req.body

    // Validation
    if (!buyer || !sourceChain || !paymentToken || !paymentAmount || !sourceTxHash) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (!ethers.isAddress(buyer)) {
      return res.status(400).json({ error: 'Invalid buyer address' })
    }

    // Connect to BrainArk network
    const provider = new ethers.JsonRpcProvider(BRAINARK_RPC)
    const oracleWallet = new ethers.Wallet(ORACLE_PRIVATE_KEY, provider)
    
    // Create contract instance
    const crossChainEPO = new ethers.Contract(
      CROSS_CHAIN_EPO_ADDRESS,
      CROSS_CHAIN_EPO_ABI,
      oracleWallet
    )

    // Check if transaction was already processed
    const isProcessed = await crossChainEPO.isTransactionProcessed(sourceTxHash)
    if (isProcessed) {
      return res.status(400).json({ error: 'Transaction already processed' })
    }

    // Verify the payment transaction on source chain (this is important for security)
    const paymentVerified = await verifySourceTransaction(
      sourceChain,
      sourceTxHash,
      paymentToken,
      paymentAmount
    )

    if (!paymentVerified) {
      return res.status(400).json({ error: 'Payment verification failed' })
    }

    // Convert payment amount to the format expected by the contract
    const paymentAmountWei = ethers.parseUnits(
      paymentAmount,
      getTokenDecimals(paymentToken, sourceChain)
    )

    // Process the cross-chain purchase
    const tx = await crossChainEPO.processCrossChainPurchase(
      buyer,
      sourceChain,
      paymentToken,
      paymentAmountWei,
      sourceTxHash
    )

    // Wait for transaction confirmation
    const receipt = await tx.wait()

    // Log the successful processing
    console.log('Cross-chain purchase processed:', {
      buyer,
      sourceChain,
      paymentToken,
      paymentAmount,
      sourceTxHash,
      brainarkTxHash: receipt.hash
    })

    return res.status(200).json({
      success: true,
      brainarkTxHash: receipt.hash,
      bakAmount: calculateBAKAmount(parseFloat(paymentAmount), paymentToken),
      message: 'Cross-chain purchase processed successfully'
    })

  } catch (error: any) {
    console.error('Cross-chain purchase processing error:', error)
    return res.status(500).json({
      error: 'Failed to process cross-chain purchase',
      details: error.message
    })
  }
}

// Helper function to verify payment transaction on source chain
async function verifySourceTransaction(
  sourceChain: string,
  txHash: string,
  expectedToken: string,
  expectedAmount: string
): Promise<boolean> {
  try {
    let rpcUrl: string
    
    switch (sourceChain.toLowerCase()) {
      case 'ethereum':
        rpcUrl = 'https://eth.llamarpc.com'
        break
      case 'bsc':
        rpcUrl = 'https://bsc-dataseed.binance.org'
        break
      case 'polygon':
        rpcUrl = 'https://polygon-rpc.com'
        break
      default:
        throw new Error(`Unsupported source chain: ${sourceChain}`)
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const receipt = await provider.getTransactionReceipt(txHash)
    
    if (!receipt || !receipt.status) {
      return false
    }

    const transaction = await provider.getTransaction(txHash)
    if (!transaction) {
      return false
    }

    // Additional verification logic would go here
    // - Check recipient address matches treasury
    // - Check amount matches expected amount
    // - For ERC20 tokens, parse transfer events
    // - Verify transaction is recent (not replayed)
    
    console.log('Transaction verified:', {
      txHash,
      sourceChain,
      from: transaction.from,
      to: transaction.to,
      value: transaction.value.toString()
    })

    return true
  } catch (error) {
    console.error('Transaction verification error:', error)
    return false
  }
}

// Helper function to get token decimals
function getTokenDecimals(tokenSymbol: string, sourceChain: string): number {
  const decimalsMap: Record<string, Record<string, number>> = {
    ethereum: { USDT: 6, USDC: 6, ETH: 18 },
    bsc: { USDT: 18, USDC: 18, BNB: 18 },
    polygon: { USDT: 6, USDC: 6, MATIC: 18 }
  }

  return decimalsMap[sourceChain.toLowerCase()]?.[tokenSymbol] || 18
}

// Helper function to calculate BAK amount
function calculateBAKAmount(paymentAmount: number, tokenSymbol: string): number {
  const tokenPrices: Record<string, number> = {
    USDT: 1,
    USDC: 1,
    ETH: 2500,
    BNB: 300,
    MATIC: 0.8
  }

  const BAK_PRICE_USD = 0.02
  const tokenPrice = tokenPrices[tokenSymbol] || 1
  const usdValue = paymentAmount * tokenPrice
  
  return usdValue / BAK_PRICE_USD
}