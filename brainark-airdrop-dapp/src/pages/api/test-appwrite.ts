import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check environment variables
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID  
    const apiKey = process.env.APPWRITE_API_KEY
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
    const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS

    console.log('Appwrite config check:', {
      endpoint: !!endpoint,
      projectId: !!projectId,
      apiKey: !!apiKey,
      databaseId: !!databaseId,
      collectionId: !!collectionId,
      endpointValue: endpoint,
      projectIdValue: projectId
    })

    if (!endpoint || !projectId || !apiKey) {
      return res.status(500).json({ 
        error: 'Missing Appwrite configuration',
        config: {
          endpoint: !!endpoint,
          projectId: !!projectId,
          apiKey: !!apiKey
        }
      })
    }

    // Try to connect to Appwrite
    const { Client, Databases } = await import('appwrite')
    
    const client = new Client()
    client
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey)

    const databases = new Databases(client)
    
    // Test basic connection
    try {
      const result = await databases.list()
      console.log('Appwrite databases list:', result)
      
      return res.status(200).json({
        success: true,
        message: 'Appwrite connection successful',
        databases: result.databases?.length || 0,
        config: {
          endpoint,
          projectId: projectId.substring(0, 8) + '...',
          hasApiKey: !!apiKey
        }
      })
    } catch (dbError: any) {
      console.error('Database connection error:', dbError)
      return res.status(500).json({
        error: 'Failed to connect to Appwrite databases',
        details: dbError.message,
        config: {
          endpoint,
          projectId: projectId.substring(0, 8) + '...',
          hasApiKey: !!apiKey
        }
      })
    }

  } catch (error: any) {
    console.error('Appwrite test error:', error)
    res.status(500).json({ 
      error: 'Appwrite test failed',
      details: error.message
    })
  }
}