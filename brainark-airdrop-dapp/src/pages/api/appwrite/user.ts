import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  try {
    switch (method) {
      case 'GET':
        const { walletAddress } = req.query
        if (!walletAddress || typeof walletAddress !== 'string') {
          return res.status(400).json({ error: 'Wallet address required' })
        }

        try {
          const { Client, Databases, Query } = await import('appwrite')
          
          // Validate required environment variables
          const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
          const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
          const apiKey = process.env.APPWRITE_API_KEY
          const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'default'
          const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS || 'users'

          if (!endpoint || !projectId || !apiKey) {
            console.error('Missing Appwrite configuration:', { 
              endpoint: !!endpoint, 
              projectId: !!projectId, 
              apiKey: !!apiKey 
            })
            return res.status(200).json({ user: null })
          }
          
          const client = new Client()
          client
            .setEndpoint(endpoint)
            .setProject(projectId)
            .setKey(apiKey)
          
          const databases = new Databases(client)
          const response = await databases.listDocuments(
            databaseId,
            collectionId,
            [Query.equal('walletAddress', walletAddress)]
          )
          
          const user = response.documents.length > 0 ? response.documents[0] : null
          return res.status(200).json({ user })
        } catch (error) {
          console.error('User fetch error:', error)
          return res.status(200).json({ user: null })
        }

      case 'POST':
        const userData = req.body
        if (!userData.walletAddress) {
          return res.status(400).json({ error: 'Wallet address required' })
        }

        try {
          const { Client, Databases, Query, ID } = await import('appwrite')
          
          // Validate required environment variables
          const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
          const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
          const apiKey = process.env.APPWRITE_API_KEY
          const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'default'
          const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS || 'users'

          if (!endpoint || !projectId || !apiKey) {
            console.error('Missing Appwrite configuration:', { 
              endpoint: !!endpoint, 
              projectId: !!projectId, 
              apiKey: !!apiKey 
            })
            return res.status(500).json({ error: 'Appwrite configuration missing' })
          }
          
          const client = new Client()
          client
            .setEndpoint(endpoint)
            .setProject(projectId)
            .setKey(apiKey)
          
          const databases = new Databases(client)
          
          // Check if user already exists
          const existing = await databases.listDocuments(
            databaseId,
            collectionId,
            [Query.equal('walletAddress', userData.walletAddress)]
          )
          
          if (existing.documents.length > 0) {
            // Update existing user
            const updatedUser = await databases.updateDocument(
              databaseId,
              collectionId,
              existing.documents[0].$id,
              {
                ...userData,
                lastLogin: new Date().toISOString()
              }
            )
            return res.status(200).json({ user: updatedUser })
          }

          // Create new user
          const user = await databases.createDocument(
            databaseId,
            collectionId,
            ID.unique(),
            {
              ...userData,
              registrationDate: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            }
          )
          return res.status(201).json({ user })
        } catch (error) {
          console.error('User creation error:', error)
          return res.status(500).json({ error: 'Failed to create/update user' })
        }

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('User API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}