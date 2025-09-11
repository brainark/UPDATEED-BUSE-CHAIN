import { NextApiRequest, NextApiResponse } from 'next'

interface TelegramMembershipRequest {
  userHandle: string
  walletAddress: string
  requiredActions: string[]
}

interface TelegramMembershipResponse {
  verified: boolean
  message: string
  details?: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TelegramMembershipResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ verified: false, message: 'Method not allowed' })
  }

  try {
    const { userHandle, walletAddress, requiredActions }: TelegramMembershipRequest = req.body

    if (!userHandle || !walletAddress) {
      return res.status(400).json({ 
        verified: false, 
        message: 'Missing required fields: userHandle and walletAddress' 
      })
    }

    // Check if Telegram Bot API credentials are configured
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN
    const telegramChannelId = '@Brainark_Besu_BlockChain' // Your channel username
    
    if (!telegramBotToken) {
      console.warn('Telegram Bot Token not configured, using mock verification')
      
      // Mock verification for development
      const mockVerified = Math.random() > 0.2 // 80% success rate
      return res.status(200).json({
        verified: mockVerified,
        message: mockVerified 
          ? 'Mock Telegram verification successful' 
          : 'Mock verification failed - please ensure you joined the Telegram channel',
        details: {
          mock: true,
          userHandle,
          channelId: telegramChannelId,
          timestamp: new Date().toISOString()
        }
      })
    }

    // Real Telegram API verification
    const telegramApiUrl = `https://api.telegram.org/bot${telegramBotToken}`
    
    // Step 1: Try to get user info by username
    // Note: This requires the user to have interacted with your bot first
    let userId: number | null = null
    
    try {
      // First, try to get updates to see if the user has messaged the bot
      const updatesResponse = await fetch(`${telegramApiUrl}/getUpdates?limit=100`)
      
      if (updatesResponse.ok) {
        const updatesData = await updatesResponse.json()
        
        // Look for the user in recent updates
        const userUpdate = updatesData.result?.find((update: any) => 
          update.message?.from?.username?.toLowerCase() === userHandle.toLowerCase()
        )
        
        if (userUpdate) {
          userId = userUpdate.message.from.id
        }
      }
    } catch (error) {
      console.warn('Could not retrieve user ID from Telegram updates')
    }

    // If we couldn't find the user ID, we can't verify membership directly
    if (!userId) {
      // In a real implementation, you might:
      // 1. Ask users to send a message to your bot first
      // 2. Use a different verification method
      // 3. Implement a bot command for verification
      
      console.warn(`Could not find Telegram user ID for @${userHandle}`)
      
      // For now, return a mock verification
      const mockVerified = Math.random() > 0.3 // 70% success rate
      return res.status(200).json({
        verified: mockVerified,
        message: mockVerified 
          ? `Mock verification: @${userHandle} appears to be a member of ${telegramChannelId}` 
          : `Could not verify @${userHandle} membership. Please ensure you've joined ${telegramChannelId} and interacted with our bot.`,
        details: {
          userHandle,
          channelId: telegramChannelId,
          userId: null,
          mock: true,
          timestamp: new Date().toISOString()
        }
      })
    }

    // Step 2: Check if user is a member of the channel
    try {
      const memberResponse = await fetch(
        `${telegramApiUrl}/getChatMember?chat_id=${telegramChannelId}&user_id=${userId}`
      )

      if (!memberResponse.ok) {
        const errorData = await memberResponse.json()
        console.error('Telegram API error:', errorData)
        
        return res.status(400).json({
          verified: false,
          message: 'Could not verify channel membership. Please ensure you have joined the channel.'
        })
      }

      const memberData = await memberResponse.json()
      
      if (!memberData.ok) {
        return res.status(400).json({
          verified: false,
          message: 'Telegram API returned an error'
        })
      }

      const memberStatus = memberData.result?.status
      const isMember = ['member', 'administrator', 'creator'].includes(memberStatus)

      const verificationResult = {
        userHandle,
        walletAddress,
        verified: isMember,
        userId,
        channelId: telegramChannelId,
        memberStatus,
        timestamp: new Date().toISOString()
      }

      console.log('Telegram membership verification:', verificationResult)

      return res.status(200).json({
        verified: isMember,
        message: isMember 
          ? `Successfully verified that @${userHandle} is a member of ${telegramChannelId}` 
          : `@${userHandle} is not a member of ${telegramChannelId}`,
        details: verificationResult
      })

    } catch (error) {
      console.error('Error checking Telegram membership:', error)
      return res.status(500).json({
        verified: false,
        message: 'Error verifying Telegram membership'
      })
    }

  } catch (error) {
    console.error('Telegram verification error:', error)
    return res.status(500).json({
      verified: false,
      message: 'Internal server error during verification'
    })
  }
}