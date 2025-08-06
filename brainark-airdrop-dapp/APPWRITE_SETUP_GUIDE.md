# Appwrite Cloud Setup Guide for BrainArk Airdrop DApp

## Overview
This guide will help you set up Appwrite Cloud (Free Tier) as the database backend for your BrainArk Airdrop DApp. Appwrite provides a secure, scalable, and easy-to-use backend-as-a-service solution.

## Why Appwrite Cloud?

### ✅ Perfect for Your DApp:
- **Free Tier**: 75,000 requests/month, 2GB bandwidth, 2GB storage
- **No Server Setup**: Fully managed cloud service
- **Real-time**: Live updates and subscriptions
- **Security**: Built-in authentication and permissions
- **Scalable**: Easy to upgrade as your DApp grows

### ✅ Features Used:
- User registration and profiles
- Social task verification tracking
- Referral system management
- Distribution batch tracking
- Real-time statistics

## Step 1: Create Appwrite Account

1. Go to [Appwrite Cloud](https://cloud.appwrite.io/)
2. Sign up for a free account
3. Verify your email address
4. Create your first project

## Step 2: Project Setup

1. **Create New Project**:
   - Click "Create Project"
   - Name: `BrainArk Airdrop DApp`
   - Project ID: `brainark-airdrop` (or your preferred ID)

2. **Get Project Credentials**:
   - Copy your Project ID from the project dashboard
   - Note the Endpoint: `https://cloud.appwrite.io/v1`

## Step 3: Database Setup

### Create Database
1. Go to "Databases" in the left sidebar
2. Click "Create Database"
3. Database ID: `brainark-airdrop`
4. Name: `BrainArk Airdrop Database`

### Create Collections

#### 1. Users Collection
- **Collection ID**: `users`
- **Name**: `Users`
- **Permissions**: 
  - Read: `users`
  - Write: `users`
  - Create: `users`
  - Update: `users`

**Attributes**:
```json
{
  "walletAddress": { "type": "string", "size": 42, "required": true },
  "referralCode": { "type": "string", "size": 10, "required": true },
  "totalEarned": { "type": "double", "required": true, "default": 0 },
  "registrationDate": { "type": "datetime", "required": true },
  "distributionBatch": { "type": "integer", "required": false },
  "distributionStatus": { "type": "string", "size": 20, "required": true, "default": "pending" },
  "estimatedDistributionTime": { "type": "string", "size": 100, "required": false }
}
```

**Indexes**:
- `walletAddress` (unique)
- `referralCode` (unique)

#### 2. Airdrop Registrations Collection
- **Collection ID**: `airdrop_registrations`
- **Name**: `Airdrop Registrations`

**Attributes**:
```json
{
  "userId": { "type": "string", "size": 36, "required": true },
  "walletAddress": { "type": "string", "size": 42, "required": true },
  "referralCode": { "type": "string", "size": 10, "required": true },
  "referredBy": { "type": "string", "size": 10, "required": false },
  "socialTasksCompleted": { "type": "boolean", "required": true, "default": false },
  "registrationDate": { "type": "datetime", "required": true },
  "distributionBatch": { "type": "integer", "required": true },
  "tokensEarned": { "type": "double", "required": true, "default": 10 },
  "status": { "type": "string", "size": 20, "required": true, "default": "pending" }
}
```

**Indexes**:
- `walletAddress` (unique)
- `userId`
- `status`

#### 3. Social Tasks Collection
- **Collection ID**: `social_tasks`
- **Name**: `Social Tasks`

**Attributes**:
```json
{
  "userId": { "type": "string", "size": 36, "required": true },
  "taskId": { "type": "string", "size": 50, "required": true },
  "taskName": { "type": "string", "size": 100, "required": true },
  "completed": { "type": "boolean", "required": true, "default": false },
  "verifiedAt": { "type": "datetime", "required": false },
  "platform": { "type": "string", "size": 50, "required": true }
}
```

**Indexes**:
- `userId`
- `taskId`
- `completed`

#### 4. Referrals Collection
- **Collection ID**: `referrals`
- **Name**: `Referrals`

**Attributes**:
```json
{
  "referrerId": { "type": "string", "size": 36, "required": true },
  "refereeId": { "type": "string", "size": 36, "required": true },
  "refereeWalletAddress": { "type": "string", "size": 42, "required": true },
  "bonusEarned": { "type": "double", "required": true, "default": 3.2 },
  "createdAt": { "type": "datetime", "required": true },
  "status": { "type": "string", "size": 20, "required": true, "default": "pending" }
}
```

**Indexes**:
- `referrerId`
- `refereeId`
- `status`

#### 5. Distribution Batches Collection
- **Collection ID**: `distribution_batches`
- **Name**: `Distribution Batches`

**Attributes**:
```json
{
  "batchNumber": { "type": "integer", "required": true },
  "totalParticipants": { "type": "integer", "required": true, "default": 0 },
  "processedParticipants": { "type": "integer", "required": true, "default": 0 },
  "startTime": { "type": "datetime", "required": false },
  "endTime": { "type": "datetime", "required": false },
  "status": { "type": "string", "size": 20, "required": true, "default": "pending" }
}
```

**Indexes**:
- `batchNumber` (unique)
- `status`

## Step 4: Environment Configuration

Update your `.env.local` file with your Appwrite credentials:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_actual_project_id_here
NEXT_PUBLIC_APPWRITE_DATABASE_ID=brainark-airdrop
NEXT_PUBLIC_APPWRITE_COLLECTION_USERS=users
NEXT_PUBLIC_APPWRITE_COLLECTION_AIRDROP=airdrop_registrations
NEXT_PUBLIC_APPWRITE_COLLECTION_SOCIAL_TASKS=social_tasks
NEXT_PUBLIC_APPWRITE_COLLECTION_REFERRALS=referrals
NEXT_PUBLIC_APPWRITE_COLLECTION_BATCHES=distribution_batches
```

## Step 5: Update Your Component

Replace the existing AutoDistributionAirdrop component with the Appwrite-enabled version:

```tsx
// In your index.tsx or wherever you use the component
import AutoDistributionAirdropWithAppwrite from '@/components/AutoDistributionAirdropWithAppwrite'

// Replace:
// <AutoDistributionAirdrop />
// With:
<AutoDistributionAirdropWithAppwrite />
```

## Step 6: Testing

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test the integration**:
   - Connect your wallet
   - Complete social tasks
   - Register for airdrop
   - Check Appwrite console for data

## Step 7: Security Configuration

### Database Permissions
Set up proper permissions for each collection:

1. **Users Collection**:
   - Read: `users`
   - Create: `users`
   - Update: `users`
   - Delete: `users`

2. **Other Collections**:
   - Read: `users`
   - Create: `users`
   - Update: `users`
   - Delete: `users`

### API Keys (Optional)
For server-side operations, you can create API keys:
1. Go to "Settings" → "API Keys"
2. Create a new API key with appropriate scopes
3. Store securely in server environment variables

## Features Enabled

### ✅ User Management
- Automatic user creation on wallet connection
- Referral code generation
- Profile updates

### ✅ Airdrop Registration
- Social task verification tracking
- Registration with referral support
- Distribution batch assignment

### ✅ Referral System
- Referral tracking and rewards
- Bonus calculation
- Referral statistics

### ✅ Real-time Statistics
- Live participant count
- Distribution progress
- Batch processing status

### ✅ Data Persistence
- All user data stored securely
- Automatic backups
- 99.9% uptime guarantee

## Monitoring and Analytics

### Appwrite Console
- Monitor database usage
- View real-time statistics
- Check API request logs
- Manage user permissions

### Usage Tracking
- Request count monitoring
- Storage usage tracking
- Bandwidth monitoring
- Performance metrics

## Scaling Considerations

### Free Tier Limits
- **Requests**: 75,000/month
- **Bandwidth**: 2GB/month
- **Storage**: 2GB total
- **Users**: Unlimited

### Upgrade Path
When you exceed free tier limits:
1. **Pro Plan**: $15/month
   - 750,000 requests
   - 20GB bandwidth
   - 20GB storage
   - Priority support

2. **Scale Plan**: $25/month
   - 1.5M requests
   - 40GB bandwidth
   - 40GB storage
   - Advanced features

## Troubleshooting

### Common Issues

1. **Connection Errors**:
   - Verify project ID and endpoint
   - Check network connectivity
   - Validate environment variables

2. **Permission Errors**:
   - Review collection permissions
   - Check user authentication
   - Verify API key scopes

3. **Data Not Saving**:
   - Check required fields
   - Validate data types
   - Review collection schema

### Debug Mode
Enable debug logging in development:
```tsx
// In your appwrite.ts file
client.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setSelfSigned(true) // Only for development
```

## Support Resources

- **Documentation**: [Appwrite Docs](https://appwrite.io/docs)
- **Community**: [Discord](https://discord.gg/GSeTUeA)
- **GitHub**: [Appwrite GitHub](https://github.com/appwrite/appwrite)
- **Support**: [Support Portal](https://appwrite.io/support)

## Conclusion

Your BrainArk Airdrop DApp is now powered by Appwrite Cloud, providing:
- ✅ Secure data storage
- ✅ Real-time updates
- ✅ Scalable architecture
- ✅ Professional backend
- ✅ Zero server maintenance

The integration provides a robust foundation for your airdrop campaign with professional-grade data management and security.