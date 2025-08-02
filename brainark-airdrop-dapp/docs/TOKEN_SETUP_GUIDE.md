# BrainArk EPO Token Setup & Wallet Management Guide

## 🎯 Overview

This guide explains how to set up payment tokens, manage treasury wallets, and handle liquidity for your BrainArk EPO system.

## 💰 Wallet Strategy Options

### Option 1: Single Treasury Wallet (Simplest)
- **Pros**: Easy to manage, single point of control
- **Cons**: All tokens in one wallet, potential security risk

```solidity
// All payments go to one wallet
address treasuryWallet = 0xE45ab484E375f34A429169DeB52C94ab49E8838f;
```

### Option 2: Separate Wallets per Token (Recommended)
- **Pros**: Better security, easier accounting, risk distribution
- **Cons**: More wallets to manage

```solidity
// Separate wallets for each token type
address ethWallet = 0xE45ab484E375f34A429169DeB52C94ab49E8838f;    // ETH payments
address usdtWallet = 0x15Ef0864D17b2E559D704EF08C7d692eFbC0A4eF;   // USDT payments  
address usdcWallet = 0x[NEW_WALLET_ADDRESS];                        // USDC payments
address bnbWallet = 0x[NEW_WALLET_ADDRESS];                         // BNB payments
```

### Option 3: Multi-Signature Wallets (Most Secure)
- **Pros**: Maximum security, requires multiple approvals
- **Cons**: More complex setup and management

## 🚀 Step-by-Step Setup

### Step 1: Deploy Payment Tokens on BrainArk Network

```bash
# Deploy payment tokens
npm run deploy-tokens

# This will deploy:
# - BrainArkUSDT (6 decimals)
# - BrainArkUSDC (6 decimals) 
# - BrainArkBNB (18 decimals)
# - BrainArkWETH (18 decimals, optional)
```

### Step 2: Create Treasury Wallets

#### Option A: Generate New Wallets
```bash
# Generate new wallets for each token
node scripts/generate-wallets.js

# Output:
# ETH Wallet: 0x... (Private Key: 0x...)
# USDT Wallet: 0x... (Private Key: 0x...)
# USDC Wallet: 0x... (Private Key: 0x...)
# BNB Wallet: 0x... (Private Key: 0x...)
```

#### Option B: Use Existing Wallets
```bash
# Use your existing wallets
ETH_WALLET=0xE45ab484E375f34A429169DeB52C94ab49E8838f
USDT_WALLET=0x15Ef0864D17b2E559D704EF08C7d692eFbC0A4eF
USDC_WALLET=0x[YOUR_USDC_WALLET]
BNB_WALLET=0x[YOUR_BNB_WALLET]
```

### Step 3: Deploy Enhanced EPO Contract

```bash
# Deploy with wallet configuration
npx hardhat run scripts/deploy-enhanced-epo.js --network brainark
```

### Step 4: Configure Payment Tokens

```bash
# Configure ETH (native token)
cast send $EPO_CONTRACT "configurePaymentToken(address,bool,uint8,uint256,uint256,uint256,string,address)" \
  0x0000000000000000000000000000000000000000 \
  true \
  18 \
  2000000000000000000000 \
  1000000000000000000 \
  10000000000000000000000 \
  "ETH" \
  $ETH_WALLET

# Configure USDT
cast send $EPO_CONTRACT "configurePaymentToken(address,bool,uint8,uint256,uint256,uint256,string,address)" \
  $USDT_CONTRACT \
  true \
  6 \
  1000000000000000000 \
  1000000 \
  10000000000 \
  "USDT" \
  $USDT_WALLET

# Configure USDC  
cast send $EPO_CONTRACT "configurePaymentToken(address,bool,uint8,uint256,uint256,uint256,string,address)" \
  $USDC_CONTRACT \
  true \
  6 \
  1000000000000000000 \
  1000000 \
  10000000000 \
  "USDC" \
  $USDC_WALLET

# Configure BNB
cast send $EPO_CONTRACT "configurePaymentToken(address,bool,uint8,uint256,uint256,uint256,string,address)" \
  $BNB_CONTRACT \
  true \
  18 \
  300000000000000000000 \
  1000000000000000000 \
  10000000000000000000000 \
  "BNB" \
  $BNB_WALLET
```

## 🏦 Liquidity Management

### BAK Token Funding

The EPO contract needs BAK tokens to distribute to buyers:

```bash
# Fund the EPO contract with 100M BAK tokens
# Transfer from your genesis wallet to EPO contract
cast send --value 100000000000000000000000000 $EPO_CONTRACT --private-key $GENESIS_PRIVATE_KEY
```

### Payment Token Liquidity

You have several options for obtaining payment tokens:

#### Option 1: Mint Initial Supply (For Testing)
```bash
# Mint tokens for testing/initial liquidity
cast send $USDT_CONTRACT "mint(address,uint256)" $YOUR_WALLET 1000000000000 # 1M USDT
cast send $USDC_CONTRACT "mint(address,uint256)" $YOUR_WALLET 1000000000000 # 1M USDC  
cast send $BNB_CONTRACT "mint(address,uint256)" $YOUR_WALLET 1000000000000000000000000 # 1M BNB
```

#### Option 2: Bridge from Other Networks
```bash
# Set up bridges from:
# - Ethereum (for real USDT/USDC/ETH)
# - BSC (for real BNB)
# - Other networks as needed
```

#### Option 3: DEX Integration
```bash
# Create liquidity pools on DEXes
# Users can swap other tokens for your payment tokens
```

## 📊 Treasury Management Dashboard

Create a dashboard to monitor your treasury wallets:

```typescript
// Treasury monitoring service
class TreasuryMonitor {
  async getBalances() {
    return {
      eth: await getETHBalance(ETH_WALLET),
      usdt: await getTokenBalance(USDT_CONTRACT, USDT_WALLET),
      usdc: await getTokenBalance(USDC_CONTRACT, USDC_WALLET),
      bnb: await getTokenBalance(BNB_CONTRACT, BNB_WALLET),
    };
  }
  
  async getTotalUSDValue() {
    const balances = await this.getBalances();
    const prices = await getCurrentPrices();
    
    return {
      ethValue: balances.eth * prices.eth,
      usdtValue: balances.usdt * prices.usdt,
      usdcValue: balances.usdc * prices.usdc,
      bnbValue: balances.bnb * prices.bnb,
      total: /* sum of all values */
    };
  }
}
```

## 🔄 Automated Treasury Management

### Auto-Conversion Service
```typescript
// Automatically convert received tokens to stablecoins
class AutoConverter {
  async convertToStable(token: string, amount: number) {
    if (token === 'ETH' || token === 'BNB') {
      // Convert volatile tokens to USDT/USDC
      await swapOnDEX(token, 'USDT', amount * 0.8); // Keep 20% in original token
    }
  }
}
```

### Yield Generation
```typescript
// Generate yield on treasury funds
class YieldManager {
  async deployToYieldFarms() {
    // Deploy USDT/USDC to lending protocols
    // Stake BNB for rewards
    // Provide liquidity to DEX pools
  }
}
```

## 🔒 Security Best Practices

### Multi-Signature Setup
```bash
# Use Gnosis Safe or similar for treasury wallets
# Require 2-of-3 or 3-of-5 signatures for large transactions
```

### Regular Audits
```bash
# Schedule regular balance checks
# Monitor for unusual transactions
# Set up alerts for large movements
```

### Cold Storage
```bash
# Keep majority of funds in cold storage
# Only keep operational amounts in hot wallets
```

## 📈 Recommended Treasury Allocation

```
Total Treasury Value: 100%
├── 40% - Stablecoins (USDT/USDC) - Low risk, high liquidity
├── 30% - ETH - Medium risk, good liquidity  
├── 20% - BNB - Medium risk, ecosystem alignment
└── 10% - Emergency Reserve - Cold storage
```

## 🚨 Emergency Procedures

### Pause EPO
```bash
# Pause contract in emergency
cast send $EPO_CONTRACT "pause()" --private-key $OWNER_PRIVATE_KEY
```

### Emergency Withdrawal
```bash
# Withdraw funds from contract
cast send $EPO_CONTRACT "emergencyWithdraw(address,uint256,address)" \
  $TOKEN_ADDRESS $AMOUNT $SAFE_WALLET --private-key $OWNER_PRIVATE_KEY
```

## 📋 Daily Operations Checklist

- [ ] Check treasury wallet balances
- [ ] Monitor EPO purchase volume
- [ ] Update token prices if needed
- [ ] Review transaction logs
- [ ] Check for any failed transactions
- [ ] Monitor smart contract health
- [ ] Backup wallet data

This setup gives you maximum flexibility and security for managing your EPO treasury while maintaining operational efficiency.