import { NextApiRequest, NextApiResponse } from 'next'

interface TwitterFollowRequest {
  userHandle: string
  walletAddress: string
  requiredActions: string[]
}

interface TwitterFollowResponse {
  verified: boolean
  message: string
  details?: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TwitterFollowResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ verified: false, message: 'Method not allowed' })
  }

  try {
    const { userHandle, walletAddress, requiredActions }: TwitterFollowRequest = req.body

    if (!userHandle || !walletAddress) {
      return res.status(400).json({ 
        verified: false, 
        message: 'Missing required fields: userHandle and walletAddress' 
      })
    }

    // Check if Twitter API credentials are configured
    const twitterBearerToken = process.env.TWITTER_BEARER_TOKEN
    if (!twitterBearerToken) {
      console.warn('Twitter Bearer Token not configured, using mock verification')
      
      // Mock verification for development
      const mockVerified = Math.random() > 0.3 // 70% success rate
      return res.status(200).json({
        verified: mockVerified,
        message: mockVerified 
          ? 'Mock verification successful' 
          : 'Mock verification failed - please ensure you followed @sdogcoin1',
        details: {
          mock: true,
          userHandle,
          timestamp: new Date().toISOString()
        }
      })
    }

    // Real Twitter API verification
    const targetUsername = 'sdogcoin1' // The account users should follow
    
    // Step 1: Get user ID from username
    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${userHandle}`,
      {
        headers: {
          'Authorization': `Bearer ${twitterBearerToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!userResponse.ok) {
      return res.status(400).json({
        verified: false,
        message: 'Twitter user not found or API error'
      })
    }

    const userData = await userResponse.json()
    const userId = userData.data?.id

    if (!userId) {
      return res.status(400).json({
        verified: false,
        message: 'Could not retrieve user ID from Twitter'
      })
    }

    // Step 2: Get target account ID
    const targetResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${targetUsername}`,
      {
        headers: {
          'Authorization': `Bearer ${twitterBearerToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!targetResponse.ok) {
      return res.status(500).json({
        verified: false,
        message: 'Could not verify target account'
      })
    }

    const targetData = await targetResponse.json()
    const targetUserId = targetData.data?.id

    // Step 3: Check if user follows target account
    const followingResponse = await fetch(
      `https://api.twitter.com/2/users/${userId}/following?user.fields=id,username&max_results=1000`,
      {
        headers: {
          'Authorization': `Bearer ${twitterBearerToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!followingResponse.ok) {
      return res.status(500).json({
        verified: false,
        message: 'Could not check following status'
      })
    }

    const followingData = await followingResponse.json()
    const isFollowing = followingData.data?.some((user: any) => user.id === targetUserId)

    // Store verification result (in a real app, you'd save this to a database)
    const verificationResult = {
      userHandle,
      walletAddress,
      verified: isFollowing,
      timestamp: new Date().toISOString(),
      targetAccount: targetUsername,
      userId,
      targetUserId
    }

    console.log('Twitter follow verification:', verificationResult)

    return res.status(200).json({
      verified: isFollowing,
      message: isFollowing 
        ? `Successfully verified that @${userHandle} follows @${targetUsername}` 
        : `@${userHandle} is not following @${targetUsername}`,
      details: verificationResult
    })

  } catch (error) {
    console.error('Twitter verification error:', error)
    return res.status(500).json({
      verified: false,
      message: 'Internal server error during verification'
    })
  }
}