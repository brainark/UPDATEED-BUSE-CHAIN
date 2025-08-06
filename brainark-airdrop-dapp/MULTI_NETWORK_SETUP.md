# Multi-Network Treasury Setup for BrainArk BAK Token Sales

## Overview

This setup allows users to purchase BAK tokens by paying with their preferred cryptocurrencies on their native networks, making the purchase process much more user-friendly and accessible.

## Supported Networks & Tokens

### 🔷 Ethereum Mainnet (Chain ID: 1)
- **ETH** (Native) → Treasury: `0xd9cf4c4a3324332766e3df3f98754d0ae42b16a9`
- **USDT** (ERC20) → Treasury: `0xf263244e45d41ecfdcdfd41b7458a3c05fa93810`
- **USDC** (ERC20) → Treasury: `0x5809b31deb605033537768b027730ab35c646dc1`

### 🟡 BSC Mainnet (Chain ID: 56)
- **BNB** (Native) → Treasury: `0x71086d15c6c549171cfded90047014a542dc7ad6`
- **USDT** (BEP20) → Treasury: `0xa8f2c8f5b5d5e5f5c5b5a5f5e5d5c5b5a5f5e5d5`
- **USDC** (BEP20) → Treasury: `0xb9e3d9f6c6e6f6d6c6b6f6e6d6c6b6f6e6d6c6b6`

### 🟣 Polygon Mainnet (Chain ID: 137)
- **MATIC** (Native) → Treasury: `0xc0f4e0g7d7f7g7e7d7c7g7f7e7d7c7g7f7e7d7c7`
- **USDT** (Polygon) → Treasury: `0xd1g5f1h8e8g8h8f8e8d8h8g8f8e8d8h8g8f8e8d8`
- **USDC** (Polygon) → Treasury: `0xe2h6g2i9f9h9i9g9f9e9i9h9g9f9e9i9h9g9f9e9`

### 🌟 BrainArk Network (Chain ID: 424242)
- **BAK Distribution** → Treasury: `0xE45ab484E375f34A429169DeB52C94ab49E8838f`

## How It Works

### 1. User Payment Flow
```
User selects token → Switches to correct network → Sends payment → Receives BAK on BrainArk
```

1. **Token Selection**: User chooses their preferred token (ETH, BNB, MATIC, USDT, USDC)
2. **Network Detection**: System detects if user is on the correct network
3. **Network Switching**: If needed, prompts user to switch to the token's native network
4. **Payment**: User sends payment to the corresponding treasury address
5. **BAK Distribution**: System automatically distributes BAK tokens on BrainArk network

### 2. Cross-Chain Processing
```
Payment Detection → Verification → BAK Calculation → Distribution → Confirmation
```

1. **Payment Monitoring**: Service monitors all treasury addresses across networks
2. **Transaction Verification**: Confirms payment transactions on respective networks
3. **BAK Calculation**: Calculates BAK amount based on USD value (BAK = $0.02)
4. **Cross-Chain Distribution**: Sends BAK tokens to user's address on BrainArk network
5. **Status Updates**: Updates payment status and notifies user

## Token Contract Addresses

### Ethereum Mainnet
- **USDT**: `0xdAC17F958D2ee523a2206206994597C13D831ec7`
- **USDC**: `0xA0b86a33E6441b8C4505B8C4505B8C4505B8C4505`

### BSC Mainnet
- **USDT**: `0x55d398326f99059fF775485246999027B3197955`
- **USDC**: `0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d`

### Polygon Mainnet
- **USDT**: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`
- **USDC**: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`

## Environment Configuration

### Required Environment Variables

```bash
# Ethereum Mainnet
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
ETHEREUM_CHAIN_ID=1
NEXT_PUBLIC_ETH_MAINNET_TREASURY=0xd9cf4c4a3324332766e3df3f98754d0ae42b16a9
NEXT_PUBLIC_USDT_ETHEREUM_TREASURY=0xf263244e45d41ecfdcdfd41b7458a3c05fa93810
NEXT_PUBLIC_USDC_ETHEREUM_TREASURY=0x5809b31deb605033537768b027730ab35c646dc1

# BSC Mainnet
BSC_RPC_URL=https://bsc-dataseed1.binance.org/
BSC_CHAIN_ID=56
NEXT_PUBLIC_BNB_BSC_TREASURY=0x71086d15c6c549171cfded90047014a542dc7ad6
NEXT_PUBLIC_USDT_BSC_TREASURY=0xa8f2c8f5b5d5e5f5c5b5a5f5e5d5c5b5a5f5e5d5
NEXT_PUBLIC_USDC_BSC_TREASURY=0xb9e3d9f6c6e6f6d6c6b6f6e6d6c6b6f6e6d6c6b6

# Polygon Mainnet
POLYGON_RPC_URL=https://polygon-rpc.com/
POLYGON_CHAIN_ID=137
NEXT_PUBLIC_MATIC_POLYGON_TREASURY=0xc0f4e0g7d7f7g7e7d7c7g7f7e7d7c7g7f7e7d7c7
NEXT_PUBLIC_USDT_POLYGON_TREASURY=0xd1g5f1h8e8g8h8f8e8d8h8g8f8e8d8h8g8f8e8d8
NEXT_PUBLIC_USDC_POLYGON_TREASURY=0xe2h6g2i9f9h9i9g9f9e9i9h9g9f9e9i9h9g9f9e9

# BrainArk Network
NEXT_PUBLIC_BAK_BRAINARK_TREASURY=0xE45ab484E375f34A429169DeB52C94ab49E8838f
BAK_BRAINARK_PRIVATE_KEY=0x6f89j123ef4i356789012345f356789012345f356789012345f3567890123456
```

### Private Keys (SECURE STORAGE REQUIRED)
```bash
# Treasury Private Keys - NEVER COMMIT TO GIT!
ETH_MAINNET_PRIVATE_KEY=0x...
USDT_ETHEREUM_PRIVATE_KEY=0x...
USDC_ETHEREUM_PRIVATE_KEY=0x...
BNB_BSC_PRIVATE_KEY=0x...
USDT_BSC_PRIVATE_KEY=0x...
USDC_BSC_PRIVATE_KEY=0x...
MATIC_POLYGON_PRIVATE_KEY=0x...
USDT_POLYGON_PRIVATE_KEY=0x...
USDC_POLYGON_PRIVATE_KEY=0x...
```

## Implementation Components

### 1. Multi-Network Configuration (`multiNetworkConfig.ts`)
- Network definitions and RPC endpoints
- Token configurations with contract addresses
- Treasury address mappings
- Price calculations and conversions

### 2. Payment Component (`MultiNetworkPayment.tsx`)
- User interface for token selection
- Network switching functionality
- Payment processing and confirmation
- Real-time BAK amount calculation

### 3. Cross-Chain Service (`crossChainPaymentService.ts`)
- Payment monitoring across all networks
- Transaction verification and processing
- Automated BAK distribution on BrainArk network
- Payment status tracking and notifications

## Security Considerations

### 1. Private Key Management
- **Never commit private keys to version control**
- Use environment variables or secure key management systems
- Consider using hardware wallets for treasury management
- Implement multi-signature wallets for large amounts

### 2. Treasury Security
- Monitor treasury balances regularly
- Set up alerts for large transactions
- Implement withdrawal limits and approval processes
- Use separate hot/cold wallet strategies

### 3. Smart Contract Security
- Audit all smart contracts before deployment
- Implement proper access controls
- Use proven libraries (OpenZeppelin)
- Test thoroughly on testnets

## Monitoring & Analytics

### 1. Payment Tracking
- Real-time payment monitoring across all networks
- Transaction confirmation tracking
- Failed payment detection and retry mechanisms
- User notification systems

### 2. Treasury Management
- Balance monitoring across all networks
- Automated balance alerts
- Transaction history and reporting
- Multi-network dashboard

### 3. Analytics Dashboard
- Total payments by network and token
- BAK distribution statistics
- User acquisition metrics
- Revenue tracking in USD

## Deployment Steps

### 1. Environment Setup
```bash
# 1. Clone repository
git clone <repository-url>
cd brainark-airdrop-dapp

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Start development server
npm run dev
```

### 2. Treasury Wallet Setup
```bash
# Generate new treasury wallets (if needed)
node scripts/generateTreasuryWallets.js

# Fund treasury wallets with gas tokens
# ETH for Ethereum network
# BNB for BSC network
# MATIC for Polygon network
# BAK for BrainArk network
```

### 3. Service Deployment
```bash
# Start payment monitoring service
npm run start:payment-service

# Deploy to production
npm run build
npm run start
```

## Testing

### 1. Testnet Testing
- Test on Goerli (Ethereum), BSC Testnet, Mumbai (Polygon)
- Use testnet tokens for payments
- Verify BAK distribution on BrainArk testnet

### 2. Integration Testing
- Test network switching functionality
- Verify payment processing across all networks
- Test error handling and edge cases

### 3. Security Testing
- Penetration testing of payment flows
- Smart contract audits
- Private key security verification

## Maintenance

### 1. Regular Tasks
- Monitor treasury balances
- Update token prices
- Check service health
- Review transaction logs

### 2. Updates
- Update RPC endpoints if needed
- Adjust gas prices for optimal performance
- Update token contract addresses if changed
- Monitor for network upgrades

## Support & Troubleshooting

### Common Issues
1. **Network switching fails**: Check MetaMask configuration
2. **Payment not detected**: Verify treasury addresses and RPC endpoints
3. **BAK distribution delayed**: Check BrainArk network status
4. **Transaction fails**: Verify gas settings and token balances

### Contact Information
- Technical Support: support@brainark.online
- Security Issues: security@brainark.online
- General Inquiries: info@brainark.online

## Conclusion

This multi-network setup significantly improves user experience by allowing payments on familiar networks while maintaining the benefits of the BrainArk ecosystem. The automated cross-chain processing ensures seamless BAK token distribution while maintaining security and transparency.

The system is designed to be scalable and can easily support additional networks and tokens as the ecosystem grows.