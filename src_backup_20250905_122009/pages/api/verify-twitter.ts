import type { NextApiRequest, NextApiResponse } from 'next'
import { AppwriteService } from '@/lib/appwrite'

interface TwitterVerificationRequest {
  address: string
  username: string
  taskType: 'follow' | 'retweet'
}

interface TwitterVerificationResponse {
  success: boolean
  verified: boolean
  message: string
}

// Twitter API v2 configuration
const TWITTER_API_BASE = 'https://api.twitter.com/2'
const TARGET_TWITTER_USERNAME = 'sdogcoin1' // Your Twitter handle
const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TwitterVerificationResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      verified: false,
      message: 'Method not allowed'
    })
  }

  try {
    const { address, username, taskType }: TwitterVerificationRequest = req.body

    if (!address || !username || !taskType) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Missing required parameters'
      })
    }

    // Verify Twitter follow
    let isVerified = false
    
    if (BEARER_TOKEN) {
      // Use real Twitter API if bearer token is available
      isVerified = await verifyTwitterFollow(username.replace('@', ''), TARGET_TWITTER_USERNAME)
    } else {
      // Fallback to simulation mode for development
      console.log('⚠️ No TWITTER_BEARER_TOKEN found, using simulation mode')
      isVerified = await simulateTwitterVerification(username, taskType)
    }

    if (isVerified) {
      // Store verification in Appwrite
      await storeVerificationInAppwrite(address, 'twitter_follow', username, true)
    }

    return res.status(200).json({
      success: true,
      verified: isVerified,
      message: isVerified 
        ? `✅ Successfully verified that @${username} follows @${TARGET_TWITTER_USERNAME}` 
        : `❌ Could not verify that @${username} follows @${TARGET_TWITTER_USERNAME}. Please ensure you're following and try again.`
    })

  } catch (error) {
    console.error('Twitter verification error:', error)
    return res.status(500).json({
      success: false,
      verified: false,
      message: 'Verification failed. Please try again later.'
    })
  }
}

// Real Twitter API verification
async function verifyTwitterFollow(username: string, targetUsername: string): Promise<boolean> {
  if (!BEARER_TOKEN) return false

  try {
    // Step 1: Get the user ID of the username we want to check
    const userResponse = await fetch(
      `${TWITTER_API_BASE}/users/by/username/${username}`,
      {
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!userResponse.ok) {
      console.log(`User @${username} not found on Twitter`)
      return false
    }

    const userData = await userResponse.json()
    const userId = userData.data?.id

    if (!userId) {
      console.log(`Could not get user ID for @${username}`)
      return false
    }

    // Step 2: Get the target account ID
    const targetResponse = await fetch(
      `${TWITTER_API_BASE}/users/by/username/${targetUsername}`,
      {
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!targetResponse.ok) {
      console.log(`Target user @${targetUsername} not found`)
      return false
    }

    const targetData = await targetResponse.json()
    const targetUserId = targetData.data?.id

    if (!targetUserId) {
      console.log(`Could not get user ID for @${targetUsername}`)
      return false
    }

    // Step 3: Check if user follows target
    const followResponse = await fetch(
      `${TWITTER_API_BASE}/users/${userId}/following/${targetUserId}`,
      {
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!followResponse.ok) {
      return false
    }

    const followData = await followResponse.json()
    return followData.data?.following === true

  } catch (error) {
    console.error('Twitter API error:', error)
    return false
  }
}

// Fallback simulation for development
async function simulateTwitterVerification(username: string, taskType: string): Promise<boolean> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // For development: return true for valid-looking usernames
  const validPattern = /^[a-zA-Z0-9_]{1,15}$/
  const isValidUsername = validPattern.test(username)
  
  // 70% success rate for valid usernames, 10% for invalid ones
  return isValidUsername ? Math.random() > 0.3 : Math.random() > 0.9
}

// Store verification in Appwrite
async function storeVerificationInAppwrite(
  walletAddress: string, 
  taskId: string, 
  username: string, 
  verified: boolean
): Promise<void> {
  try {
    // First, get the user from Appwrite
    const user = await AppwriteService.getUserByWallet(walletAddress)
    
    if (!user?.$id) {
      console.error('User not found in Appwrite for address:', walletAddress)
      return
    }

    // Create social task record
    await AppwriteService.createSocialTask({
      userId: user.$id,
      taskId: taskId,
      taskName: 'Follow on Twitter/X',
      completed: verified,
      verifiedAt: verified ? new Date().toISOString() : undefined,
      platform: 'Twitter'
    })

    console.log(`✅ Stored Twitter verification for ${walletAddress}: ${verified}`)
  } catch (error) {
    console.error('Error storing verification in Appwrite:', error)
  }
}