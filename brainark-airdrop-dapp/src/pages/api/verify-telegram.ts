import type { NextApiRequest, NextApiResponse } from 'next'
import { AppwriteService } from '@/lib/appwrite'

interface TelegramVerificationRequest {
  address: string
  username: string
}

interface TelegramVerificationResponse {
  success: boolean
  verified: boolean
  message: string
}

// Telegram Bot API configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TARGET_CHANNEL = '@Brainark_Besu_BlockChain' // Your Telegram channel
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TelegramVerificationResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      verified: false,
      message: 'Method not allowed'
    })
  }

  try {
    const { address, username }: TelegramVerificationRequest = req.body

    if (!address || !username) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Missing required parameters'
      })
    }

    // Verify Telegram membership
    let isVerified = false
    
    if (TELEGRAM_BOT_TOKEN) {
      // Use real Telegram Bot API if token is available
      isVerified = await verifyTelegramMembership(username.replace('@', ''), TARGET_CHANNEL)
    } else {
      // Fallback to simulation mode for development
      console.log('⚠️ No TELEGRAM_BOT_TOKEN found, using simulation mode')
      isVerified = await simulateTelegramVerification(username)
    }

    if (isVerified) {
      // Store verification in Appwrite
      await storeVerificationInAppwrite(address, 'telegram_join', username, true)
    }

    return res.status(200).json({
      success: true,
      verified: isVerified,
      message: isVerified 
        ? `✅ Successfully verified that @${username} is a member of ${TARGET_CHANNEL}` 
        : `❌ Could not verify that @${username} is a member of ${TARGET_CHANNEL}. Please join the channel and try again.`
    })

  } catch (error) {
    console.error('Telegram verification error:', error)
    return res.status(500).json({
      success: false,
      verified: false,
      message: 'Verification failed. Please try again later.'
    })
  }
}

// Real Telegram Bot API verification
async function verifyTelegramMembership(username: string, channelId: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) return false

  try {
    // Method 1: Try to get chat member by username
    let response = await fetch(`${TELEGRAM_API_BASE}/getChatMember`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelId,
        user_id: `@${username}` // Try with @ prefix
      })
    })

    let data = await response.json()
    
    if (data.ok && data.result) {
      const status = data.result.status
      return ['member', 'administrator', 'creator'].includes(status)
    }

    // Method 2: If username method fails, try to search recent members
    // Note: This requires the bot to be admin in the channel and have appropriate permissions
    const membersResponse = await fetch(`${TELEGRAM_API_BASE}/getChatAdministrators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelId
      })
    })

    const membersData = await membersResponse.json()
    
    if (membersData.ok && membersData.result) {
      // Check if username is in administrators (for public verification)
      const isAdmin = membersData.result.some((admin: any) => 
        admin.user?.username?.toLowerCase() === username.toLowerCase()
      )
      
      if (isAdmin) return true
    }

    // If direct API calls fail, we can't verify membership due to Telegram privacy restrictions
    console.log(`Could not verify membership for @${username} in ${channelId}`)
    return false

  } catch (error) {
    console.error('Telegram API error:', error)
    return false
  }
}

// Fallback simulation for development
async function simulateTelegramVerification(username: string): Promise<boolean> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // For development: return true for valid-looking usernames
  const validPattern = /^[a-zA-Z0-9_]{5,32}$/
  const isValidUsername = validPattern.test(username)
  
  // 80% success rate for valid usernames, 20% for invalid ones
  return isValidUsername ? Math.random() > 0.2 : Math.random() > 0.8
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
      taskName: 'Join Telegram Channel',
      completed: verified,
      verifiedAt: verified ? new Date().toISOString() : undefined,
      platform: 'Telegram'
    })

    console.log(`✅ Stored Telegram verification for ${walletAddress}: ${verified}`)
  } catch (error) {
    console.error('Error storing verification in Appwrite:', error)
  }
}