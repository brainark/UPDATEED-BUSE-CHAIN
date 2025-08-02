# BrainArk Airdrop & EPO DApp

A comprehensive Next.js-based decentralized application for BrainArk's airdrop distribution and Early Public Offering (EPO) built with modern web3 technologies.

## 🌟 Features

### 🎁 Airdrop System
- **10M BAK Token Distribution**: 10 BAK tokens per user for up to 1 million participants
- **Referral Bonus System**: 3.2 BAK tokens per successful referral (5M total pool)
- **Social Task Verification**: Twitter follow/retweet and Telegram join requirements
- **Automatic Distribution**: Triggers when 1M participants reached
- **One-time Claim**: Prevents double-claiming with mapping verification

### 💰 EPO (Early Public Offering)
- **Fixed Price**: $0.02 per BAK token
- **Multi-Payment Support**: ETH, USDT, USDC, BNB
- **100M Token Supply**: Available for purchase
- **No Time Limits**: Always open for purchases
- **Trading Panel**: Real-time price tracking and order book
- **Admin Controls**: Price updates and fund withdrawal

### 🔗 Wallet Integration
- **MetaMask Support**: Primary wallet connection
- **WalletConnect**: Mobile wallet support
- **BrainArk Network**: Custom EVM-compatible chain (Chain ID: 1337)
- **RainbowKit**: Enhanced wallet connection UI

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, ShadCN UI, Headless UI
- **Web3**: Wagmi, RainbowKit, Viem, Ethers.js
- **Blockchain**: Hyperledger Besu (IBFT consensus)
- **Smart Contracts**: Solidity 0.8.19, OpenZeppelin
- **Database**: Firebase/Supabase (configurable)
- **APIs**: Twitter API v2, Telegram Bot API
- **Build Tools**: Hardhat, TypeScript

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MetaMask or compatible wallet
- Access to BrainArk Besu network

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd brainark-airdrop-dapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Compile smart contracts**
   ```bash
   npm run compile
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
brainark-airdrop-dapp/
├── contracts/                    # Smart contracts
│   ├── BrainArkAirdrop.sol      # Airdrop contract
│   └── BrainArkEPO.sol          # EPO contract
├── scripts/                     # Deployment scripts
│   └── deploy.js                # Main deployment script
├── src/
│   ├── components/              # React components
│   │   ├── AirdropSection.tsx   # Airdrop interface
│   │   ├── EPOSection.tsx       # EPO interface
│   │   ├── TradingPanel.tsx     # Trading panel
│   │   └── ...
│   ├── pages/                   # Next.js pages
│   │   ├── index.tsx            # Landing page
│   │   ├── airdrop.tsx          # Airdrop page
│   │   ├── epo.tsx              # EPO page
│   │   ├── whitepaper.tsx       # Documentation
│   │   └── api/                 # API routes
│   ├── utils/                   # Utilities and configurations
│   │   ├── config.ts            # App configuration
│   │   ├── contracts.ts         # Contract ABIs
│   │   └── wagmi.ts             # Wallet configuration
│   └── styles/                  # Global styles
├── public/                      # Static assets
├── hardhat.config.js           # Hardhat configuration
└── package.json                # Dependencies and scripts
```

## 📄 Pages Overview

- **`/`** - Landing page with hero section and navigation tabs
- **`/airdrop`** - Airdrop claim interface with social task verification
- **`/epo`** - EPO purchase interface with integrated trading panel
- **`/success`** - Transaction confirmation and success page
- **`/whitepaper`** - Technical documentation and explorer link

## 📋 Smart Contracts

### BrainArkAirdrop.sol
- **Purpose**: Manages 10M BAK token airdrop distribution
- **Features**:
  - Social media task verification (Twitter + Telegram)
  - Referral bonus system (3.2 BAK per referral)
  - Automatic distribution trigger at 1M participants
  - One-time claim per wallet
  - Emergency controls

### BrainArkEPO.sol
- **Purpose**: Handles Early Public Offering token sales
- **Features**:
  - Fixed $0.02 per BAK pricing
  - Multi-token payment support (ETH, USDT, USDC, BNB)
  - 100M BAK token supply
  - Admin price updates
  - Treasury fund management

## ⚙️ Configuration

### Network Settings
- **Chain ID**: 1337
- **Network Name**: BrainArk Besu Network
- **RPC URL**: https://rpc.brainark.online
- **Explorer**: https://explorer.brainark.online
- **Native Token**: BAK (18 decimals)

### Wallet Addresses
- **Airdrop Distribution**: `0x15Ef0864D17b2E559D704EF08C7d692eFbC0A4eF`
- **EPO Treasury**: `0xE45ab484E375f34A429169DeB52C94ab49E8838f`

### Social Media Links
- **Twitter**: https://x.com/sdogcoin1
- **Telegram**: https://t.me/Brainark_Besu_BlockChain

## 🚀 Deployment Guide

### 1. Environment Setup
```bash
# Copy and configure environment variables
cp .env.example .env.local

# Required variables:
PRIVATE_KEY=your_deployment_private_key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
TWITTER_BEARER_TOKEN=your_twitter_token
TELEGRAM_BOT_TOKEN=your_telegram_token
```

### 2. Smart Contract Deployment
```bash
# Compile contracts
npm run compile

# Deploy to BrainArk network
npm run deploy

# Deploy to local network (for testing)
npm run deploy:local
```

### 3. Post-Deployment Configuration
1. Update `.env.local` with deployed contract addresses
2. Fund airdrop distribution wallet with 15M BAK tokens
3. Fund EPO contract with 100M BAK tokens
4. Configure payment token addresses in EPO contract
5. Set up social media API credentials

### 4. Frontend Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Smart Contracts
npm run compile         # Compile contracts
npm run deploy          # Deploy to BrainArk network
npm run deploy:local    # Deploy to local network
npm run test            # Run contract tests
```

## 🔌 API Integration

### Twitter Verification
- **Endpoint**: `/api/verify-twitter`
- **Tasks**: Follow @sdogcoin1, retweet pinned post
- **API**: Twitter API v2 with Bearer Token

### Telegram Verification
- **Endpoint**: `/api/verify-telegram`
- **Task**: Join @Brainark_Besu_BlockChain
- **API**: Telegram Bot API with Bot Token

### Statistics API
- **Endpoint**: `/api/stats`
- **Data**: Airdrop participants, EPO sales, referral metrics

## 📊 Key Features

### Social Task Verification
1. **Twitter Follow**: Verify user follows @sdogcoin1
2. **Twitter Retweet**: Verify user retweeted pinned post
3. **Telegram Join**: Verify user joined the channel

### Referral System
- Generate unique referral links
- Track referral conversions
- Automatic bonus distribution (3.2 BAK per referral)
- 5M BAK total referral pool

### Trading Panel
- Real-time price updates
- Order book simulation
- Recent trades display
- 24h statistics
- Quick action buttons

## 🔒 Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency stop functionality
- **Ownable**: Access control for admin functions
- **Input Validation**: Comprehensive parameter checking
- **Rate Limiting**: API endpoint protection

## 📈 Metrics & Analytics

- Airdrop participation rates
- EPO purchase volumes
- Social task completion rates
- Referral conversion metrics
- Geographic distribution
- Wallet connection analytics

## 🎨 UI/UX Features

- **Dark/Light Mode**: Automatic theme switching
- **Responsive Design**: Mobile-first approach
- **Loading States**: Smooth user experience
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Real-time feedback
- **Progress Indicators**: Visual progress tracking

## 🔗 External Links

- **Block Explorer**: https://explorer.brainark.online
- **Twitter**: https://x.com/sdogcoin1
- **Telegram**: https://t.me/Brainark_Besu_BlockChain
- **RPC Endpoint**: https://rpc.brainark.online

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support & Community

- **GitHub Issues**: Report bugs and feature requests
- **Telegram Community**: Join for real-time support
- **Twitter**: Follow for updates and announcements
- **Documentation**: Comprehensive guides and tutorials

## 🚧 Roadmap

- [ ] Mobile app development
- [ ] DEX integration
- [ ] Governance token features
- [ ] Staking mechanisms
- [ ] Cross-chain bridge
- [ ] NFT marketplace integration

---

**Built with ❤️ for the BrainArk ecosystem**