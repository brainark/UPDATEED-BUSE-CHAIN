# 🔐 Oracle Setup Guide for Cross-Chain EPO

## 📋 Oracle Wallet Details
```
Address:     0xc74CC2004e40ae32DD5ED5c74043422DA3892722
Private Key: 0x15e21b4b4d7e32df9ce839a9a3b71c0b0010879f95a6a9e6ffdef9a3f8b8908a
Mnemonic:    rubber food cattle oil film tube brave skin lemon patient ignore length
```

## 🚀 Quick Setup Steps

### 1. Add Oracle to Encrypted Environment
```bash
./add-oracle-config.sh
# Enter your existing encryption password when prompted
```

### 2. Deploy Cross-Chain Contract
```bash
# Deploy BrainArkEPOCrossChain to BrainArk network
cd /home/brainark/brainark_besu_chain/brainark-airdrop-dapp
npx hardhat run scripts/deploy-cross-chain.js --network brainark
```

### 3. Fund Oracle Wallet
```bash
# Send 1000 BAK to oracle for gas fees
# To: 0xc74CC2004e40ae32DD5ED5c74043422DA3892722
```

### 4. Authorize Oracle in Contract
```javascript
// Call this function on your deployed contract
await crossChainEPO.setAuthorizedOracle("0xc74CC2004e40ae32DD5ED5c74043422DA3892722", true);
```

### 5. Update Contract Address in Environment
```bash
# After deployment, update CROSS_CHAIN_EPO_ADDRESS in encrypted environment
# Re-run add-oracle-config.sh with the new contract address
```

## 🔧 How to Use Your Oracle Private Key

### Option 1: Direct Environment Variable (Recommended)
```bash
# Your encrypted environment now contains:
ORACLE_PRIVATE_KEY=0x15e21b4b4d7e32df9ce839a9a3b71c0b0010879f95a6a9e6ffdef9a3f8b8908a
```

### Option 2: Load from Encrypted Environment
```bash
# Use your existing load-env.sh script:
./load-env.sh npm run dev
# This automatically loads ORACLE_PRIVATE_KEY from encrypted environment
```

### Option 3: Environment in API Routes
```typescript
// In your API routes (like process-cross-chain-purchase.ts):
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY;
const oracleWallet = new ethers.Wallet(ORACLE_PRIVATE_KEY, provider);
```

## 📊 Treasury Addresses Configured

| Network  | Treasury Address |
|----------|------------------|
| Ethereum | 0x742d35Cc6634C0532925a3b8D0C9bd0D8f05B89C |
| BSC      | 0x742d35Cc6634C0532925a3b8D0C9bd0D8f05B89C |
| Polygon  | 0x742d35Cc6634C0532925a3b8D0C9bd0D8f05B89C |

## 🔒 Security Best Practices

### ✅ What's Secure:
- ✅ Private key stored in encrypted environment file
- ✅ Automatic cleanup of temporary files
- ✅ Backup created before modifications
- ✅ Random API secret key generated
- ✅ Oracle wallet dedicated for automation only

### 🚨 Security Reminders:
- 🔐 Keep your encryption password secure
- 💰 Monitor oracle wallet balance (needs BAK for gas)
- 🔄 Rotate oracle private key periodically
- 📊 Monitor oracle transaction activity
- 🛡️ Use separate wallet for treasury management

## 🧪 Testing Cross-Chain Payments

### 1. Start Development Server
```bash
./load-env.sh npm run dev
```

### 2. Visit Cross-Chain EPO Page
```
http://localhost:3002/cross-chain-epo
```

### 3. Test Payment Flow
1. Connect MetaMask to any supported network
2. Select payment token (USDT, USDC, etc.)
3. Enter payment amount
4. Process payment (auto network switching)
5. Receive BAK tokens on BrainArk network

## 🔧 Troubleshooting

### Oracle Wallet Not Working?
```bash
# Check oracle wallet balance
cast balance 0xc74CC2004e40ae32DD5ED5c74043422DA3892722 --rpc-url https://rpc.brainark.online

# Check if oracle is authorized
cast call CROSS_CHAIN_CONTRACT "authorizedOracles(address)" 0xc74CC2004e40ae32DD5ED5c74043422DA3892722 --rpc-url https://rpc.brainark.online
```

### Environment Variables Not Loading?
```bash
# Test environment decryption
./load-env.sh echo "Environment loaded successfully"

# Check specific variable
./load-env.sh bash -c 'echo "Oracle address: $ORACLE_ADDRESS"'
```

### Cross-Chain Payments Failing?
1. Check oracle wallet has BAK for gas
2. Verify contract address in environment
3. Confirm oracle is authorized in contract
4. Check API endpoint logs: `/api/process-cross-chain-purchase`

## 📞 Support Commands

### Generate New Oracle (if needed)
```bash
node scripts/generateOracleWallet.js
```

### Load Environment for Testing
```bash
./load-env.sh node -e "console.log('Oracle:', process.env.ORACLE_ADDRESS)"
```

### Deploy Cross-Chain Contract
```bash
./load-env.sh npx hardhat run scripts/deploy.js --network brainark
```

---

## 🎯 Summary

**Your Oracle Private Key**: `0x15e21b4b4d7e32df9ce839a9a3b71c0b0010879f95a6a9e6ffdef9a3f8b8908a`

This key is now securely stored in your encrypted `.env.production.enc` file and can be loaded using your existing `load-env.sh` script. The oracle enables automatic processing of cross-chain payments, allowing users to pay with USDT/USDC on any network and receive BAK tokens on BrainArk.