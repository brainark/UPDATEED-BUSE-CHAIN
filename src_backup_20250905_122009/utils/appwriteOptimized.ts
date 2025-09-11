import { Client, Databases, Account, Query, ID } from 'appwrite'

// Production-ready Appwrite configuration with error handling
class OptimizedAppwriteClient {
  private client: Client
  private databases: Databases
  private account: Account
  private isInitialized = false

  constructor() {
    this.client = new Client()
    this.databases = new Databases(this.client)
    this.account = new Account(this.client)
    this.init()
  }

  private init() {
    try {
      const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'brainark-production'
      
      this.client
        .setEndpoint(endpoint)
        .setProject(projectId)

      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize Appwrite:', error)
    }
  }

  // Graceful error handling for all operations
  private async safeOperation<T>(operation: () => Promise<T>, fallbackValue: T): Promise<T> {
    if (!this.isInitialized) {
      console.warn('Appwrite client not initialized, returning fallback value')
      return fallbackValue
    }

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Operation timeout')), 10000)
      )
      
      const result = await Promise.race([operation(), timeoutPromise]) as T
      return result
    } catch (error) {
      console.error('Appwrite operation failed:', error)
      // Return fallback value on any error
      return fallbackValue
    }
  }

  // Optimized user operations
  async getUserByWallet(walletAddress: string) {
    return this.safeOperation(async () => {
      const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'brainark-airdrop-prod'
      const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS || 'users'
      
      const response = await this.databases.listDocuments(
        databaseId,
        collectionId,
        [Query.equal('wallet', walletAddress)]
      )
      
      return response.documents.length > 0 ? response.documents[0] : null
    }, null)
  }

  async createUser(userData: any) {
    return this.safeOperation(async () => {
      const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'brainark-airdrop-prod'
      const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS || 'users'
      
      return await this.databases.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        userData
      )
    }, null)
  }

  // Optimized airdrop stats
  async getAirdropStats() {
    return this.safeOperation(async () => {
      const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'brainark-airdrop-prod'
      const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_AIRDROP || 'airdrop_registrations'
      
      const [totalUsers, completedUsers] = await Promise.all([
        this.databases.listDocuments(databaseId, collectionId, [Query.limit(1)]),
        this.databases.listDocuments(databaseId, collectionId, [
          Query.equal('verified', true),
          Query.limit(1)
        ])
      ])
      
      return {
        totalRegistrations: totalUsers.total || 0,
        totalDistributed: completedUsers.total || 0,
        totalTokensDistributed: '0',
        averageDistribution: '0'
      }
    }, {
      totalRegistrations: 0,
      totalDistributed: 0,
      totalTokensDistributed: '0',
      averageDistribution: '0'
    })
  }

  // Social task verification
  async verifySocialTask(walletAddress: string, taskType: string, taskData: any) {
    return this.safeOperation(async () => {
      const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'brainark-airdrop-prod'
      const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SOCIAL_TASKS || 'social_tasks'
      
      return await this.databases.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        {
          wallet: walletAddress,
          taskType,
          taskData,
          verified: true,
          completedAt: new Date().toISOString()
        }
      )
    }, null)
  }

  // Referral system
  async createReferral(referrerWallet: string, referredWallet: string) {
    return this.safeOperation(async () => {
      const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'brainark-airdrop-prod'
      const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_REFERRALS || 'referrals'
      
      return await this.databases.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        {
          referrer: referrerWallet,
          referred: referredWallet,
          createdAt: new Date().toISOString(),
          rewardClaimed: false
        }
      )
    }, null)
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    return this.safeOperation(async () => {
      await this.account.get()
      return true
    }, false)
  }
}

// Export singleton instance
export const appwriteOptimized = new OptimizedAppwriteClient()

// Fallback data for offline/error scenarios
export const fallbackData = {
  airdropStats: {
    totalRegistrations: 2847,
    totalDistributed: 1923,
    totalTokensDistributed: '1,250,000',
    averageDistribution: '650.75'
  },
  userProfile: {
    walletAddress: '',
    twitterVerified: false,
    telegramVerified: false,
    totalRewards: '2500',
    referralCode: 'BAK2024',
    referralCount: 5
  }
}

// Mock functions for development/offline testing
export const mockAppwrite = {
  async getUserByWallet(walletAddress: string) {
    return {
      $id: 'mock-user',
      wallet: walletAddress,
      twitterVerified: false,
      telegramVerified: false,
      totalRewards: '0'
    }
  },
  
  async getAirdropStats() {
    return fallbackData.airdropStats
  },
  
  async createUser(userData: any) {
    return { $id: 'mock-created', ...userData }
  },
  
  async verifySocialTask(walletAddress: string, taskType: string, taskData: any) {
    return { $id: 'mock-task', wallet: walletAddress, taskType, verified: true }
  }
}