# BrainArk Airdrop DApp - Deployment Checklist

## 📋 Pre-Deployment Requirements

### ✅ Environment Setup
- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] Git repository access
- [ ] MetaMask wallet with BrainArk network configured
- [ ] Deployment wallet with sufficient BAK tokens for gas fees

### ✅ API Credentials
- [ ] Twitter Developer Account created
- [ ] Twitter API v2 Bearer Token obtained
- [ ] Telegram Bot created via @BotFather
- [ ] Telegram Bot Token obtained
- [ ] WalletConnect Project ID from https://cloud.walletconnect.com
- [ ] Firebase/Supabase project setup (optional)

### ✅ Network Configuration
- [ ] BrainArk Besu network accessible at https://rpc.brainark.online
- [ ] Block explorer available at https://explorer.brainark.online
- [ ] Chain ID 1337 confirmed
- [ ] Native BAK token functionality verified

## 🔧 Installation & Setup

### 1. Clone and Install
```bash
# Clone repository
git clone <repository-url>
cd brainark-airdrop-dapp

# Install dependencies
npm install

# Verify installation
npm run compile
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Configure required variables in .env.local:
PRIVATE_KEY=your_deployment_private_key_here
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

### 3. Smart Contract Deployment
```bash
# Compile contracts
npm run compile

# Deploy to BrainArk network
npm run deploy

# Note the deployed contract addresses for next step
```

### 4. Update Contract Addresses
```bash
# Update .env.local with deployed addresses
NEXT_PUBLIC_AIRDROP_CONTRACT=0x_deployed_airdrop_address
NEXT_PUBLIC_EPO_CONTRACT=0x_deployed_epo_address
```

## 💰 Funding Requirements

### Airdrop Distribution Wallet: `0x15Ef0864D17b2E559D704EF08C7d692eFbC0A4eF`
- [ ] **15,000,000 BAK tokens** (10M airdrop + 5M referral pool)
- [ ] Sufficient gas tokens for distribution transactions
- [ ] Wallet private key secured and backed up

### EPO Treasury Wallet: `0xE45ab484E375f34A429169DeB52C94ab49E8838f`
- [ ] **100,000,000 BAK tokens** for EPO sales
- [ ] Configured to receive payment tokens (ETH, USDT, USDC, BNB)
- [ ] Multi-signature setup recommended for security

## 🔗 Smart Contract Configuration

### Airdrop Contract Setup
```bash
# Add social verifiers (replace with actual addresses)
cast send $AIRDROP_CONTRACT "addSocialVerifier(address)" $VERIFIER_ADDRESS --private-key $PRIVATE_KEY --rpc-url https://rpc.brainark.online

# Verify contract state
cast call $AIRDROP_CONTRACT "distributionActive()" --rpc-url https://rpc.brainark.online
```

### EPO Contract Setup
```bash
# Configure ETH payment (example)
cast send $EPO_CONTRACT "updatePaymentToken(address,bool,uint8,uint256,uint256,uint256,string)" \
  0x0000000000000000000000000000000000000000 \
  true \
  18 \
  2000000000000000000000 \
  1000000000000000000 \
  10000000000000000000000 \
  "ETH" \
  --private-key $PRIVATE_KEY --rpc-url https://rpc.brainark.online

# Configure other payment tokens (USDT, USDC, BNB)
# Replace addresses with actual deployed token contracts
```

## 🌐 Frontend Deployment

### Local Testing
```bash
# Start development server
npm run dev

# Test in browser at http://localhost:3000
# Verify wallet connection
# Test airdrop claim flow
# Test EPO purchase flow
```

### Production Build
```bash
# Build for production
npm run build

# Test production build locally
npm start

# Verify all functionality works in production mode
```

### Deployment Options

#### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Configure environment variables in Vercel dashboard
# Set custom domain if needed
```

#### Option 2: Netlify
```bash
# Build and deploy
npm run build

# Upload dist folder to Netlify
# Configure environment variables
# Set up custom domain
```

#### Option 3: Traditional Hosting
```bash
# Build static files
npm run build

# Upload build files to web server
# Configure environment variables on server
# Set up SSL certificate
```

## 🔍 Post-Deployment Verification

### Smart Contract Verification
- [ ] Airdrop contract deployed and verified on explorer
- [ ] EPO contract deployed and verified on explorer
- [ ] Contract ownership transferred to secure wallet
- [ ] Social verifiers configured correctly
- [ ] Payment tokens configured in EPO contract

### Frontend Verification
- [ ] Website loads correctly on all devices
- [ ] Wallet connection works with MetaMask
- [ ] BrainArk network auto-adds to MetaMask
- [ ] Airdrop claim flow functional
- [ ] EPO purchase flow functional
- [ ] Social task verification working
- [ ] Trading panel displays correctly

### API Integration Testing
- [ ] Twitter follow verification works
- [ ] Twitter retweet verification works
- [ ] Telegram join verification works
- [ ] Statistics API returns correct data
- [ ] Error handling works properly

### Security Checks
- [ ] Private keys secured and not exposed
- [ ] Environment variables properly configured
- [ ] Rate limiting enabled on API endpoints
- [ ] CORS configured correctly
- [ ] SSL certificate installed and working

## 📊 Monitoring & Analytics

### Setup Monitoring
- [ ] Error tracking (Sentry, LogRocket, etc.)
- [ ] Analytics (Google Analytics, Mixpanel, etc.)
- [ ] Uptime monitoring (Pingdom, UptimeRobot, etc.)
- [ ] Performance monitoring (Lighthouse, WebPageTest)

### Key Metrics to Track
- [ ] Airdrop participation rate
- [ ] Social task completion rate
- [ ] EPO purchase volume
- [ ] Referral conversion rate
- [ ] Wallet connection success rate
- [ ] Page load times
- [ ] Error rates

## 🚨 Emergency Procedures

### Smart Contract Emergency Controls
```bash
# Pause airdrop contract
cast send $AIRDROP_CONTRACT "pause()" --private-key $OWNER_PRIVATE_KEY --rpc-url https://rpc.brainark.online

# Pause EPO contract
cast send $EPO_CONTRACT "pause()" --private-key $OWNER_PRIVATE_KEY --rpc-url https://rpc.brainark.online

# Emergency stop airdrop distribution
cast send $AIRDROP_CONTRACT "emergencyStop()" --private-key $OWNER_PRIVATE_KEY --rpc-url https://rpc.brainark.online
```

### Frontend Emergency Actions
- [ ] Cloudflare/CDN cache purge procedure
- [ ] Database backup and restore procedure
- [ ] Rollback deployment procedure
- [ ] Emergency contact information documented

## 📞 Support & Maintenance

### Documentation
- [ ] User guide created and published
- [ ] Technical documentation updated
- [ ] API documentation available
- [ ] Troubleshooting guide prepared

### Community Setup
- [ ] Telegram support channel active
- [ ] Twitter account posting updates
- [ ] GitHub issues monitoring setup
- [ ] FAQ section on website

### Maintenance Schedule
- [ ] Regular security updates planned
- [ ] Smart contract upgrade path defined
- [ ] Database backup schedule configured
- [ ] Performance optimization reviews scheduled

## ✅ Final Checklist

- [ ] All smart contracts deployed and verified
- [ ] Frontend deployed and accessible
- [ ] All API integrations working
- [ ] Funding wallets properly funded
- [ ] Security measures implemented
- [ ] Monitoring and analytics setup
- [ ] Documentation complete
- [ ] Emergency procedures tested
- [ ] Community channels active
- [ ] Team trained on operations

## 🎉 Go Live!

Once all items are checked off:

1. **Announce Launch**: Post on social media channels
2. **Monitor Closely**: Watch for any issues in first 24 hours
3. **Gather Feedback**: Collect user feedback and iterate
4. **Scale Gradually**: Monitor performance as user base grows

---

**Deployment completed successfully! 🚀**

*Remember to keep this checklist updated as the project evolves.*