import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN

    if (!telegramBotToken) {
      return res.status(503).json({ 
        configured: false, 
        message: 'Telegram Bot Token not configured' 
      })
    }

    // Test the Telegram Bot API with a simple request
    const testResponse = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/getMe`
    )

    if (testResponse.ok) {
      const botData = await testResponse.json()
      
      if (botData.ok) {
        return res.status(200).json({ 
          configured: true, 
          message: 'Telegram Bot API is configured and working',
          botInfo: {
            username: botData.result.username,
            firstName: botData.result.first_name
          }
        })
      } else {
        return res.status(503).json({ 
          configured: false, 
          message: 'Telegram Bot API returned an error' 
        })
      }
    } else {
      return res.status(503).json({ 
        configured: false, 
        message: 'Telegram Bot API credentials are invalid' 
      })
    }

  } catch (error) {
    console.error('Telegram API check error:', error)
    return res.status(503).json({ 
      configured: false, 
      message: 'Error checking Telegram API configuration' 
    })
  }
}