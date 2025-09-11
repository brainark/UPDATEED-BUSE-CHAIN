import type { NextApiRequest, NextApiResponse } from 'next'
import { Client, Databases, ID, Query } from 'appwrite'

// Server-side Appwrite client (no CORS issues)
const client = new Client()
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'brainark-production')

const databases = new Databases(client)
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'brainark-airdrop-prod'
const COLLECTION_USERS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS || 'users'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  try {
    switch (method) {
      case 'GET':
        // Get user by wallet address
        const { walletAddress } = req.query
        if (!walletAddress || typeof walletAddress !== 'string') {
          return res.status(400).json({ error: 'Wallet address required' })
        }

        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_USERS,
          [Query.equal('walletAddress', walletAddress)]
        )

        const user = response.documents.length > 0 ? response.documents[0] : null
        return res.status(200).json({ user })

      case 'POST':
        // Create new user
        const userData = req.body
        if (!userData.walletAddress) {
          return res.status(400).json({ error: 'Wallet address required' })
        }

        // Check if user already exists
        const existing = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_USERS,
          [Query.equal('walletAddress', userData.walletAddress)]
        )

        if (existing.documents.length > 0) {
          return res.status(200).json({ user: existing.documents[0] })
        }

        // Generate referral code
        const referralCode = `BAK${userData.walletAddress.slice(2, 8).toUpperCase()}`

        const newUser = await databases.createDocument(
          DATABASE_ID,
          COLLECTION_USERS,
          ID.unique(),
          {
            walletAddress: userData.walletAddress,
            referralCode,
            totalEarned: 0,
            registrationDate: new Date().toISOString(),
            distributionStatus: 'pending'
          }
        )

        return res.status(201).json({ user: newUser })

      case 'PUT':
        // Update user
        const { userId, ...updateData } = req.body
        if (!userId) {
          return res.status(400).json({ error: 'User ID required' })
        }

        const updatedUser = await databases.updateDocument(
          DATABASE_ID,
          COLLECTION_USERS,
          userId,
          updateData
        )

        return res.status(200).json({ user: updatedUser })

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error: any) {
    console.error('Appwrite user API error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}