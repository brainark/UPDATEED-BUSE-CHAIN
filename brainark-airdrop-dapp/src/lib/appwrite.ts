import { Client, Databases, Account, ID, Query } from 'appwrite'

// Appwrite configuration
const client = new Client()

// Initialize Appwrite client
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')

// Initialize services
export const databases = new Databases(client)
export const account = new Account(client)

// Database and Collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'brainark-airdrop'
export const COLLECTIONS = {
  USERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS || 'users',
  AIRDROP_REGISTRATIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_AIRDROP || 'airdrop_registrations',
  SOCIAL_TASKS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SOCIAL_TASKS || 'social_tasks',
  REFERRALS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_REFERRALS || 'referrals',
  DISTRIBUTION_BATCHES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BATCHES || 'distribution_batches'
}

// Types for our data structures
export interface User {
  $id?: string
  walletAddress: string
  referralCode: string
  totalEarned: number
  registrationDate: string
  distributionBatch?: number
  distributionStatus: 'pending' | 'distributing' | 'distributed'
  estimatedDistributionTime?: string
}

export interface AirdropRegistration {
  $id?: string
  userId: string
  walletAddress: string
  referralCode: string
  referredBy?: string
  socialTasksCompleted: boolean
  registrationDate: string
  distributionBatch: number
  tokensEarned: number
  status: 'pending' | 'approved' | 'distributed'
}

export interface SocialTask {
  $id?: string
  userId: string
  taskId: string
  taskName: string
  completed: boolean
  verifiedAt?: string
  platform: string
}

export interface Referral {
  $id?: string
  referrerId: string
  refereeId: string
  refereeWalletAddress: string
  bonusEarned: number
  createdAt: string
  status: 'pending' | 'completed'
}

export interface DistributionBatch {
  $id?: string
  batchNumber: number
  totalParticipants: number
  processedParticipants: number
  startTime?: string
  endTime?: string
  status: 'pending' | 'processing' | 'completed'
}

// Database operations
export class AppwriteService {
  // User operations
  static async createUser(userData: Omit<User, '$id'>): Promise<User> {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        ID.unique(),
        userData
      )
      return response as User
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  static async getUserByWallet(walletAddress: string): Promise<User | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('walletAddress', walletAddress)]
      )
      return response.documents.length > 0 ? response.documents[0] as User : null
    } catch (error) {
      console.error('Error getting user by wallet:', error)
      return null
    }
  }

  static async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
        userData
      )
      return response as User
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  // Airdrop registration operations
  static async createAirdropRegistration(registrationData: Omit<AirdropRegistration, '$id'>): Promise<AirdropRegistration> {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.AIRDROP_REGISTRATIONS,
        ID.unique(),
        registrationData
      )
      return response as AirdropRegistration
    } catch (error) {
      console.error('Error creating airdrop registration:', error)
      throw error
    }
  }

  static async getAirdropRegistration(walletAddress: string): Promise<AirdropRegistration | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.AIRDROP_REGISTRATIONS,
        [Query.equal('walletAddress', walletAddress)]
      )
      return response.documents.length > 0 ? response.documents[0] as AirdropRegistration : null
    } catch (error) {
      console.error('Error getting airdrop registration:', error)
      return null
    }
  }

  static async getAirdropStats(): Promise<{
    totalParticipants: number
    totalDistributed: number
    currentBatch: number
  }> {
    try {
      const [registrations, batches] = await Promise.all([
        databases.listDocuments(DATABASE_ID, COLLECTIONS.AIRDROP_REGISTRATIONS),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.DISTRIBUTION_BATCHES, [
          Query.equal('status', 'completed')
        ])
      ])

      return {
        totalParticipants: registrations.total,
        totalDistributed: registrations.documents.filter(doc => doc.status === 'distributed').length,
        currentBatch: batches.documents.length
      }
    } catch (error) {
      console.error('Error getting airdrop stats:', error)
      return { totalParticipants: 0, totalDistributed: 0, currentBatch: 0 }
    }
  }

  // Social task operations
  static async createSocialTask(taskData: Omit<SocialTask, '$id'>): Promise<SocialTask> {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.SOCIAL_TASKS,
        ID.unique(),
        taskData
      )
      return response as SocialTask
    } catch (error) {
      console.error('Error creating social task:', error)
      throw error
    }
  }

  static async getUserSocialTasks(userId: string): Promise<SocialTask[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.SOCIAL_TASKS,
        [Query.equal('userId', userId)]
      )
      return response.documents as SocialTask[]
    } catch (error) {
      console.error('Error getting user social tasks:', error)
      return []
    }
  }

  static async updateSocialTask(taskId: string, taskData: Partial<SocialTask>): Promise<SocialTask> {
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.SOCIAL_TASKS,
        taskId,
        taskData
      )
      return response as SocialTask
    } catch (error) {
      console.error('Error updating social task:', error)
      throw error
    }
  }

  // Referral operations
  static async createReferral(referralData: Omit<Referral, '$id'>): Promise<Referral> {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.REFERRALS,
        ID.unique(),
        referralData
      )
      return response as Referral
    } catch (error) {
      console.error('Error creating referral:', error)
      throw error
    }
  }

  static async getUserReferrals(userId: string): Promise<Referral[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.REFERRALS,
        [Query.equal('referrerId', userId)]
      )
      return response.documents as Referral[]
    } catch (error) {
      console.error('Error getting user referrals:', error)
      return []
    }
  }

  static async getReferralByCode(referralCode: string): Promise<User | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('referralCode', referralCode)]
      )
      return response.documents.length > 0 ? response.documents[0] as User : null
    } catch (error) {
      console.error('Error getting referral by code:', error)
      return null
    }
  }

  // Distribution batch operations
  static async createDistributionBatch(batchData: Omit<DistributionBatch, '$id'>): Promise<DistributionBatch> {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.DISTRIBUTION_BATCHES,
        ID.unique(),
        batchData
      )
      return response as DistributionBatch
    } catch (error) {
      console.error('Error creating distribution batch:', error)
      throw error
    }
  }

  static async getCurrentBatch(): Promise<DistributionBatch | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DISTRIBUTION_BATCHES,
        [
          Query.equal('status', 'processing'),
          Query.orderDesc('batchNumber'),
          Query.limit(1)
        ]
      )
      return response.documents.length > 0 ? response.documents[0] as DistributionBatch : null
    } catch (error) {
      console.error('Error getting current batch:', error)
      return null
    }
  }

  // Utility functions
  static generateReferralCode(walletAddress: string): string {
    return `BAK${walletAddress.slice(2, 8).toUpperCase()}`
  }

  static calculateDistributionBatch(registrationOrder: number, totalBatches: number = 24): number {
    const participantsPerBatch = Math.ceil(1000000 / totalBatches) // Assuming 1M target
    return Math.floor(registrationOrder / participantsPerBatch) + 1
  }
}

export default AppwriteService