# Social Media API Setup Guide

This guide explains how to set up real social media APIs for the BrainArk Airdrop DApp verification system.

## Overview

The airdrop component currently uses **mock verification** for social media tasks. To enable real verification, you need to configure the following APIs:

1. **Twitter API** - For verifying follows, likes, and retweets
2. **Telegram Bot API** - For verifying channel membership

## Current Status

✅ **Mock verification is working** - Users can complete tasks with simulated verification
❌ **Real APIs need configuration** - Follow the steps below to enable real verification

## 1. Twitter API Setup

### Step 1: Create a Twitter Developer Account

1. Go to [https://developer.twitter.com/](https://developer.twitter.com/)
2. Sign in with your Twitter account
3. Apply for a developer account
4. Create a new project/app

### Step 2: Get API Credentials

1. In your Twitter Developer dashboard, go to your app
2. Navigate to "Keys and tokens"
3. Generate a **Bearer Token**
4. Copy the Bearer Token

### Step 3: Configure Environment Variables

Add to your `.env.local` file:
```bash
TWITTER_BEARER_TOKEN=your_actual_bearer_token_here
```

### Step 4: API Permissions

For full verification functionality, you need:
- **Essential access** (free) - Basic user lookup
- **Elevated access** (free) - Following relationships
- **Academic Research** or **Pro** (paid) - Likes and retweets data

### Twitter API Endpoints Used

- `GET /2/users/by/username/{username}` - Get user ID from username
- `GET /2/users/{id}/following` - Check if user follows target account
- `GET /2/tweets/{id}/liking_users` - Check if user liked a tweet (requires elevated access)
- `GET /2/tweets/{id}/retweeted_by` - Check if user retweeted (requires elevated access)

## 2. Telegram Bot API Setup

### Step 1: Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the bot token provided

### Step 2: Configure Environment Variables

Add to your `.env.local` file:
```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

### Step 3: Set Up Your Channel

1. Create a Telegram channel (if you haven't already)
2. Add your bot as an administrator to the channel
3. Update the channel ID in the code if needed

### Step 4: User Interaction Requirement

**Important**: For Telegram verification to work, users must:
1. Start a conversation with your bot first
2. Send at least one message to the bot
3. Then join your channel

This is because Telegram API requires the bot to know the user's ID to check membership.

### Telegram API Endpoints Used

- `GET /bot{token}/getMe` - Verify bot token
- `GET /bot{token}/getUpdates` - Get user interactions with bot
- `GET /bot{token}/getChatMember` - Check channel membership

## 3. Implementation Details

### API Files Created

The following API endpoints have been created:

1. **`/api/verify-twitter-follow`** - Verifies Twitter follows
2. **`/api/verify-twitter-engagement`** - Verifies likes and retweets
3. **`/api/verify-telegram-membership`** - Verifies Telegram channel membership
4. **`/api/check-twitter-api`** - Health check for Twitter API
5. **`/api/check-telegram-api`** - Health check for Telegram API
6. **`/api/health`** - General API health check

### Fallback Behavior

If APIs are not configured:
- The system automatically falls back to **mock verification**
- Users see a warning about API status
- Mock verification has realistic success/failure rates
- All functionality remains working for development

### Error Handling

The system handles various error scenarios:
- Invalid API credentials
- Rate limiting
- User not found
- Network errors
- Missing permissions

## 4. Testing the APIs

### Test Twitter API
```bash
curl -X GET "http://localhost:3000/api/check-twitter-api"
```

### Test Telegram API
```bash
curl -X GET "http://localhost:3000/api/check-telegram-api"
```

### Test Verification
```bash
curl -X POST "http://localhost:3000/api/verify-twitter-follow" \
  -H "Content-Type: application/json" \
  -d '{"userHandle": "test_user", "walletAddress": "0x123...", "requiredActions": ["follow"]}'
```

## 5. Production Considerations

### Security
- Store API keys securely in environment variables
- Never commit API keys to version control
- Use different API keys for development and production
- Implement rate limiting to prevent abuse

### Rate Limits
- **Twitter API**: 300 requests per 15 minutes (free tier)
- **Telegram API**: 30 messages per second per bot

### Monitoring
- Monitor API usage and costs
- Set up alerts for API failures
- Log verification attempts for debugging

### Database Storage
Consider storing verification results in a database:
```sql
CREATE TABLE social_verifications (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL,
  platform VARCHAR(20) NOT NULL,
  task_id VARCHAR(50) NOT NULL,
  user_handle VARCHAR(100) NOT NULL,
  verified BOOLEAN NOT NULL,
  verification_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 6. Alternative Verification Methods

If API access is limited, consider these alternatives:

### Manual Verification
- Users submit screenshots
- Manual review process
- Delayed verification

### Bot Commands
- Users send specific commands to your Telegram bot
- Bot verifies and responds with a code
- Users enter the code in the dapp

### Social Proof
- Users post specific content mentioning their wallet address
- Automated scanning for mentions
- Community-driven verification

## 7. Troubleshooting

### Common Issues

**Twitter API returns 401 Unauthorized**
- Check if Bearer Token is correct
- Verify API permissions
- Ensure app has necessary access level

**Telegram API returns 404 Not Found**
- Check if bot token is correct
- Verify bot is added to the channel
- Ensure user has interacted with the bot

**User not found errors**
- Verify username format (without @ symbol)
- Check if user exists and is public
- Handle private accounts gracefully

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=true
```

This will log detailed API responses and verification steps.

## 8. Cost Estimation

### Twitter API
- **Essential**: Free (limited features)
- **Elevated**: Free (basic verification)
- **Pro**: $100/month (full verification features)

### Telegram API
- **Free** for most use cases
- Rate limits apply

### Recommended Setup for Production
- Start with free tiers
- Monitor usage and upgrade as needed
- Budget $100-200/month for full features

## 9. Next Steps

1. **Set up Twitter Developer account** and get Bearer Token
2. **Create Telegram bot** and get bot token
3. **Add environment variables** to `.env.local`
4. **Test the APIs** using the provided endpoints
5. **Monitor verification success rates** and adjust as needed
6. **Consider database storage** for production use
7. **Implement additional security measures** as needed

## Support

If you need help setting up the APIs:
1. Check the console logs for detailed error messages
2. Test individual API endpoints
3. Verify environment variables are loaded correctly
4. Review the API documentation for Twitter and Telegram

The system is designed to work with or without real APIs, so you can develop and test the full functionality even before setting up the social media integrations.