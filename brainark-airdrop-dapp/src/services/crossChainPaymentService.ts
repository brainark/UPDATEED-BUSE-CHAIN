// Cross-Chain Payment Processing Service
// Handles payments from multiple networks and BAK distribution on BrainArk network

import { ethers } from 'ethers'
import { 
  NETWORKS, 
  PAYMENT_TOKENS, 
  BAK_CONFIG,
  calculateBAKAmount,
  calculateUSDValue 
} from '../utils/multiNetworkConfig'

export interface PaymentRecord {
  id: string
  userAddress: string
  paymentNetwork: string
  paymentToken: string
  paymentAmount: string
  paymentTxHash: string
  usdValue: number
  bakAmount: number
  bakDistributionTxHash?: string
  status: 'pending' | 'confirmed' | 'distributed' | 'failed'
  timestamp: number
  blockNumber?: number
}

export interface NetworkProvider {
  network: string
  provider: ethers.JsonRpcProvider
  chainId: number
}

class CrossChainPaymentService {
  private providers: Map<string, ethers.JsonRpcProvider> = new Map()
  private brainarkProvider!: ethers.JsonRpcProvider
  private brainarkSigner!: ethers.Wallet
  private paymentRecords: Map<string, PaymentRecord> = new Map()

  constructor() {
    this.initializeProviders()
    this.initializeBrainArkConnection()
  }

  private initializeProviders() {
    // Initialize providers for each network
    Object.entries(NETWORKS).forEach(([key, network]) => {
      if (key !== 'brainark') {
        const provider = new ethers.JsonRpcProvider(network.rpcUrl)
        this.providers.set(key, provider)
      }
    })
  }

  private initializeBrainArkConnection() {
    // Initialize BrainArk network connection for BAK distribution
    this.brainarkProvider = new ethers.JsonRpcProvider(NETWORKS.brainark.rpcUrl)
    
    // Use the BAK distribution private key
    const privateKey = process.env.BAK_BRAINARK_PRIVATE_KEY
    if (privateKey) {
      this.brainarkSigner = new ethers.Wallet(privateKey, this.brainarkProvider)
    }
  }

  /**
   * Monitor payment transactions across all networks
   */
  async startPaymentMonitoring() {
    console.log('🔍 Starting cross-chain payment monitoring...')

    // Monitor each network for payments to treasury addresses
    for (const [networkKey, provider] of this.providers.entries()) {
      this.monitorNetworkPayments(networkKey, provider)
    }
  }

  private async monitorNetworkPayments(networkKey: string, provider: ethers.JsonRpcProvider) {
    console.log(`📡 Monitoring ${networkKey} network for payments...`)

    // Get treasury addresses for this network
    const networkTokens = PAYMENT_TOKENS.filter(token => token.network === networkKey)
    const treasuryAddresses = networkTokens.map(token => token.treasuryAddress)

    // Listen for new blocks
    provider.on('block', async (blockNumber) => {
      try {
        const block = await provider.getBlock(blockNumber, true)
        if (!block || !block.transactions) return

        // Check each transaction in the block
        for (const tx of block.transactions) {
          if (typeof tx === 'string') continue

          // Check if transaction is to one of our treasury addresses
          if ((tx as any).to && treasuryAddresses.includes((tx as any).to)) {
            await this.processPaymentTransaction(networkKey, tx as any, blockNumber)
          }
        }
      } catch (error) {
        console.error(`Error monitoring ${networkKey} block ${blockNumber}:`, error)
      }
    })
  }

  private async processPaymentTransaction(
    networkKey: string, 
    tx: any, 
    blockNumber: number
  ) {
    try {
      console.log(`💰 Payment detected on ${networkKey}: ${tx.hash}`)

      // Determine which token was used
      const tokenConfig = PAYMENT_TOKENS.find(token => 
        token.network === networkKey && token.treasuryAddress === tx.to
      )

      if (!tokenConfig) {
        console.error('Unknown treasury address:', tx.to)
        return
      }

      // Calculate payment details
      const paymentAmount = ethers.formatUnits(tx.value || '0', tokenConfig.decimals)
      const usdValue = calculateUSDValue(parseFloat(paymentAmount), tokenConfig.symbol)
      const bakAmount = calculateBAKAmount(parseFloat(paymentAmount), tokenConfig.symbol)

      // Create payment record
      const paymentRecord: PaymentRecord = {
        id: tx.hash,
        userAddress: tx.from || '',
        paymentNetwork: networkKey,
        paymentToken: tokenConfig.symbol,
        paymentAmount,
        paymentTxHash: tx.hash,
        usdValue,
        bakAmount,
        status: 'confirmed',
        timestamp: Date.now(),
        blockNumber
      }

      // Store payment record
      this.paymentRecords.set(tx.hash, paymentRecord)

      // Queue BAK distribution
      await this.queueBakDistribution(paymentRecord)

    } catch (error) {
      console.error('Error processing payment transaction:', error)
    }
  }

  private async queueBakDistribution(paymentRecord: PaymentRecord) {
    try {
      console.log(`🎯 Queuing BAK distribution for payment ${paymentRecord.id}`)

      // Add to distribution queue (in production, use a proper queue system)
      setTimeout(() => {
        this.distributeBakTokens(paymentRecord)
      }, 5000) // 5 second delay for confirmation

    } catch (error) {
      console.error('Error queuing BAK distribution:', error)
    }
  }

  private async distributeBakTokens(paymentRecord: PaymentRecord) {
    try {
      console.log(`🚀 Distributing ${paymentRecord.bakAmount} BAK to ${paymentRecord.userAddress}`)

      if (!this.brainarkSigner) {
        throw new Error('BrainArk signer not initialized')
      }

      // Convert BAK amount to wei (18 decimals)
      const bakAmountWei = ethers.parseEther(paymentRecord.bakAmount.toString())

      // Send BAK tokens to user
      const tx = await this.brainarkSigner.sendTransaction({
        to: paymentRecord.userAddress,
        value: bakAmountWei,
        gasLimit: 21000,
        gasPrice: 1000 // 1000 wei as per BrainArk network config
      })

      console.log(`✅ BAK distribution transaction sent: ${tx.hash}`)

      // Wait for confirmation
      const receipt = await tx.wait()
      
      if (receipt?.status === 1) {
        // Update payment record
        paymentRecord.bakDistributionTxHash = tx.hash
        paymentRecord.status = 'distributed'
        this.paymentRecords.set(paymentRecord.id, paymentRecord)

        console.log(`🎉 BAK distribution completed: ${tx.hash}`)
        
        // Emit event or notify user (implement notification system)
        this.notifyUser(paymentRecord)
      } else {
        throw new Error('BAK distribution transaction failed')
      }

    } catch (error) {
      console.error('Error distributing BAK tokens:', error)
      
      // Update payment record status
      paymentRecord.status = 'failed'
      this.paymentRecords.set(paymentRecord.id, paymentRecord)
    }
  }

  private notifyUser(paymentRecord: PaymentRecord) {
    // Implement user notification system
    // This could be email, push notification, webhook, etc.
    console.log(`📧 Notifying user ${paymentRecord.userAddress} of successful BAK distribution`)
  }

  /**
   * Get payment status by transaction hash
   */
  getPaymentStatus(txHash: string): PaymentRecord | undefined {
    return this.paymentRecords.get(txHash)
  }

  /**
   * Get all payments for a user address
   */
  getUserPayments(userAddress: string): PaymentRecord[] {
    return Array.from(this.paymentRecords.values())
      .filter(record => record.userAddress.toLowerCase() === userAddress.toLowerCase())
  }

  /**
   * Get payment statistics
   */
  getPaymentStats() {
    const records = Array.from(this.paymentRecords.values())
    
    return {
      totalPayments: records.length,
      totalUSDRaised: records.reduce((sum, record) => sum + record.usdValue, 0),
      totalBAKDistributed: records.reduce((sum, record) => sum + record.bakAmount, 0),
      paymentsByNetwork: records.reduce((acc, record) => {
        acc[record.paymentNetwork] = (acc[record.paymentNetwork] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      paymentsByToken: records.reduce((acc, record) => {
        acc[record.paymentToken] = (acc[record.paymentToken] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
  }

  /**
   * Manual BAK distribution (for admin use)
   */
  async manualBakDistribution(
    userAddress: string, 
    bakAmount: number, 
    reason: string
  ): Promise<string> {
    try {
      if (!this.brainarkSigner) {
        throw new Error('BrainArk signer not initialized')
      }

      const bakAmountWei = ethers.parseEther(bakAmount.toString())

      const tx = await this.brainarkSigner.sendTransaction({
        to: userAddress,
        value: bakAmountWei,
        gasLimit: 21000,
        gasPrice: 1000
      })

      console.log(`🔧 Manual BAK distribution: ${tx.hash} (${reason})`)
      
      return tx.hash
    } catch (error) {
      console.error('Manual BAK distribution failed:', error)
      throw error
    }
  }

  /**
   * Check treasury balances across all networks
   */
  async checkTreasuryBalances(): Promise<Record<string, Record<string, string>>> {
    const balances: Record<string, Record<string, string>> = {}

    for (const [networkKey, provider] of this.providers.entries()) {
      balances[networkKey] = {}
      
      const networkTokens = PAYMENT_TOKENS.filter(token => token.network === networkKey)
      
      for (const token of networkTokens) {
        try {
          if (token.contractAddress === '0x0000000000000000000000000000000000000000') {
            // Native token balance
            const balance = await provider.getBalance(token.treasuryAddress)
            balances[networkKey][token.symbol] = ethers.formatEther(balance)
          } else {
            // ERC20 token balance
            const contract = new ethers.Contract(
              token.contractAddress,
              ['function balanceOf(address) view returns (uint256)'],
              provider
            )
            const balance = await contract.balanceOf(token.treasuryAddress)
            balances[networkKey][token.symbol] = ethers.formatUnits(balance, token.decimals)
          }
        } catch (error) {
          console.error(`Error checking ${token.symbol} balance on ${networkKey}:`, error)
          balances[networkKey][token.symbol] = 'Error'
        }
      }
    }

    return balances
  }
}

// Export singleton instance
export const crossChainPaymentService = new CrossChainPaymentService()

export default CrossChainPaymentService