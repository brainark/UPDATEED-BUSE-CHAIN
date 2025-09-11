import type { NextApiRequest, NextApiResponse } from 'next'
import { Client, Databases, ID, Query } from 'appwrite'

const client = new Client()
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'brainark-production')

const databases = new Databases(client)
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'brainark-airdrop-prod'
const COLLECTION_SOCIAL = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SOCIAL_TASKS || 'social_tasks'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  try {
    switch (method) {
      case 'GET':
        // Get user's social tasks
        const { userId } = req.query
        if (!userId || typeof userId !== 'string') {
          return res.status(400).json({ error: 'User ID required' })
        }

        const tasks = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_SOCIAL,
          [Query.equal('userId', userId)]
        )

        return res.status(200).json({ tasks: tasks.documents })

      case 'POST':
        // Create or update social task
        const taskData = req.body
        if (!taskData.userId || !taskData.taskId) {
          return res.status(400).json({ error: 'User ID and task ID required' })
        }

        // Check if task already exists
        const existingTasks = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_SOCIAL,
          [
            Query.equal('userId', taskData.userId),
            Query.equal('taskId', taskData.taskId)
          ]
        )

        if (existingTasks.documents.length > 0) {
          // Update existing task
          const updatedTask = await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_SOCIAL,
            existingTasks.documents[0].$id,
            {
              completed: true,
              verifiedAt: new Date().toISOString()
            }
          )

          return res.status(200).json({ task: updatedTask })
        }

        // Create new task
        const newTask = await databases.createDocument(
          DATABASE_ID,
          COLLECTION_SOCIAL,
          ID.unique(),
          {
            ...taskData,
            completed: true,
            verifiedAt: new Date().toISOString()
          }
        )

        return res.status(201).json({ task: newTask })

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error: any) {
    console.error('Appwrite social tasks API error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}