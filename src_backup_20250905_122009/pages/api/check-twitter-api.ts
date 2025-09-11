import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const twitterBearerToken = process.env.TWITTER_BEARER_TOKEN

    if (!twitterBearerToken) {
      return res.status(503).json({ 
        configured: false, 
        message: 'Twitter Bearer Token not configured' 
      })
    }

    // Test the Twitter API with a simple request
    const testResponse = await fetch(
      'https://api.twitter.com/2/users/by/username/twitter',
      {
        headers: {
          'Authorization': `Bearer ${twitterBearerToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (testResponse.ok) {
      return res.status(200).json({ 
        configured: true, 
        message: 'Twitter API is configured and working' 
      })
    } else {
      return res.status(503).json({ 
        configured: false, 
        message: 'Twitter API credentials are invalid or expired' 
      })
    }

  } catch (error) {
    console.error('Twitter API check error:', error)
    return res.status(503).json({ 
      configured: false, 
      message: 'Error checking Twitter API configuration' 
    })
  }
}