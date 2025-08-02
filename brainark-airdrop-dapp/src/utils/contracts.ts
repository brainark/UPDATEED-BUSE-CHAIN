import { ethers } from 'ethers'
import { CONTRACT_ADDRESSES } from './config'

// ABI for Airdrop Contract
export const AIRDROP_ABI = [
  // Events
  'event AirdropClaimed(address indexed user, uint256 amount, address indexed referrer, uint256 referralBonus, uint256 timestamp)',
  'event ReferralBonusPaid(address indexed referrer, address indexed referee, uint256 bonus, uint256 timestamp)',
  'event SocialTaskCompleted(address indexed user, string taskType, bool verified, uint256 timestamp)',
  
  // Read functions
  'function users(address) view returns (bool hasClaimed, bool twitterFollowed, bool twitterRetweeted, bool telegramJoined, address referrer, uint256 referralCount, uint256 totalEarned, uint256 claimTimestamp)',
  'function getAirdropStats() view returns (tuple(uint256 totalParticipants, uint256 totalClaimed, uint256 totalReferralBonuses, uint256 remainingSupply, bool distributionActive, uint256 distributionStartTime))',
  'function canClaim(address user) view returns (bool)',
  'function getTimeUntilDistribution() view returns (uint256)',
  'function COINS_PER_USER() view returns (uint256)',
  'function REFERRAL_BONUS() view returns (uint256)',
  'function TARGET_PARTICIPANTS() view returns (uint256)',
  
  // Write functions
  'function claimAirdrop(address referrer)',
  'function verifySocialTask(address user, string taskType, bool verified)',
  
  // Admin functions
  'function addSocialVerifier(address verifier)',
  'function pause()',
  'function unpause()'
]

// ABI for EPO Contract
export const EPO_ABI = [
  // Events
  'event TokenPurchase(address indexed buyer, address indexed paymentToken, uint256 paymentAmount, uint256 bakAmount, uint256 usdValue, uint256 timestamp)',
  'event PaymentTokenUpdated(address indexed token, bool enabled, uint256 priceUSD, uint256 timestamp)',
  'event FundsWithdrawn(address indexed token, uint256 amount, address indexed to, uint256 timestamp)',
  
  // Read functions
  'function paymentTokens(address) view returns (bool enabled, uint8 decimals, uint256 priceUSD, uint256 minPurchaseUSD, uint256 maxPurchaseUSD, string symbol)',
  'function getEPOStats() view returns (tuple(uint256 totalBakSold, uint256 totalUSDRaised, uint256 totalPurchases, uint256 remainingSupply, uint256 bakPriceUSD, bool isActive))',
  'function calculatePurchase(address paymentToken, uint256 paymentAmount) view returns (uint256 usdValue, uint256 bakAmount)',
  'function getQuote(address paymentToken, uint256 paymentAmount) view returns (uint256 bakAmount, uint256 usdValue, uint256 effectivePrice)',
  'function getUserPurchaseHistory(address user) view returns (tuple(address buyer, address paymentToken, uint256 paymentAmount, uint256 bakAmount, uint256 usdValue, uint256 timestamp)[])',
  'function getSupportedTokens() view returns (address[])',
  'function BAK_PRICE_USD() view returns (uint256)',
  'function TOTAL_BAK_SUPPLY() view returns (uint256)',
  'function treasuryWallet() view returns (address)',
  'function fundingWallet() view returns (address)',
  
  // Write functions
  'function purchaseBAK(address paymentToken, uint256 paymentAmount, uint256 minBakAmount)',
  
  // Admin functions
  'function updatePaymentToken(address token, bool enabled, uint8 decimals, uint256 priceUSD, uint256 minPurchaseUSD, uint256 maxPurchaseUSD, string symbol)',
  'function updateTokenPrice(address token, uint256 priceUSD)',
  'function emergencyWithdraw(address token, uint256 amount, address to)',
  'function pause()',
  'function unpause()'
]

// Contract instances
export const getAirdropContract = (provider: ethers.Provider | ethers.Signer) => {
  return new ethers.Contract(CONTRACT_ADDRESSES.AIRDROP, AIRDROP_ABI, provider)
}

export const getEPOContract = (provider: ethers.Provider | ethers.Signer) => {
  return new ethers.Contract(CONTRACT_ADDRESSES.EPO, EPO_ABI, provider)
}

// Helper functions for contract interactions
export const contractHelpers = {
  // Airdrop helpers
  async getAirdropUserInfo(address: string, provider: ethers.Provider) {
    const contract = getAirdropContract(provider)
    return await contract.users(address)
  },

  async getAirdropStats(provider: ethers.Provider) {
    const contract = getAirdropContract(provider)
    return await contract.getAirdropStats()
  },

  async canClaimAirdrop(address: string, provider: ethers.Provider) {
    const contract = getAirdropContract(provider)
    return await contract.canClaim(address)
  },

  async claimAirdrop(referrer: string, signer: ethers.Signer) {
    const contract = getAirdropContract(signer)
    return await contract.claimAirdrop(referrer)
  },

  // EPO helpers
  async getEPOStats(provider: ethers.Provider) {
    const contract = getEPOContract(provider)
    return await contract.getEPOStats()
  },

  async getPaymentTokenInfo(tokenAddress: string, provider: ethers.Provider) {
    const contract = getEPOContract(provider)
    return await contract.paymentTokens(tokenAddress)
  },

  async calculatePurchase(tokenAddress: string, amount: string, provider: ethers.Provider) {
    const contract = getEPOContract(provider)
    return await contract.calculatePurchase(tokenAddress, ethers.parseEther(amount))
  },

  async purchaseBAK(tokenAddress: string, amount: string, minBAK: string, signer: ethers.Signer) {
    const contract = getEPOContract(signer)
    
    if (tokenAddress === ethers.ZeroAddress) {
      // ETH payment
      return await contract.purchaseBAK(
        tokenAddress,
        ethers.parseEther(amount),
        ethers.parseEther(minBAK),
        { value: ethers.parseEther(amount) }
      )
    } else {
      // ERC20 payment
      return await contract.purchaseBAK(
        tokenAddress,
        ethers.parseEther(amount),
        ethers.parseEther(minBAK)
      )
    }
  },

  async getUserPurchaseHistory(address: string, provider: ethers.Provider) {
    const contract = getEPOContract(provider)
    return await contract.getUserPurchaseHistory(address)
  }
}

// Error handling helpers
export const parseContractError = (error: any): string => {
  if (error?.reason) {
    return error.reason
  }
  
  if (error?.data?.message) {
    return error.data.message
  }
  
  if (error?.message) {
    if (error.message.includes('user rejected')) {
      return 'Transaction was rejected by user'
    }
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction'
    }
    if (error.message.includes('gas')) {
      return 'Transaction failed due to gas issues'
    }
    return error.message
  }
  
  return 'Unknown contract error occurred'
}

// Transaction helpers
export const waitForTransaction = async (
  txHash: string,
  provider: ethers.Provider,
  confirmations: number = 1
) => {
  try {
    const receipt = await provider.waitForTransaction(txHash, confirmations)
    return receipt
  } catch (error) {
    console.error('Transaction failed:', error)
    throw error
  }
}

// Gas estimation helpers
export const estimateGas = async (
  contract: ethers.Contract,
  method: string,
  args: any[]
) => {
  try {
    const gasEstimate = await contract[method].estimateGas(...args)
    // Add 20% buffer
    return (gasEstimate * 120n) / 100n
  } catch (error) {
    console.error('Gas estimation failed:', error)
    // Return a default gas limit
    return 500000n
  }
}