# BrainArk Validator Time-Lock Contract

A 30-year time-lock smart contract that secures 400 million BAK tokens for validator rewards, releasing 1.11 million BAK monthly.

## 🎯 Overview

This contract implements BrainArk's validator tokenomics by:
- Locking 400M BAK tokens for 30 years
- Releasing 1,111,111 BAK tokens monthly (13.33M annually)
- Ensuring long-term network security through guaranteed validator rewards
- Providing transparent, automated, and trustless token distribution

## 📊 Key Specifications

| Parameter | Value |
|-----------|-------|
| **Total Locked** | 400,000,000 BAK |
| **Monthly Release** | 1,111,111 BAK |
| **Annual Release** | 13,333,333 BAK |
| **Lock Duration** | 30 years (360 months) |
| **Release Interval** | 30 days |

## 🔧 Contract Functions

### Public Functions (Anyone can call)
- `releaseTokens()` - Triggers monthly token release when due
- `calculateReleaseAmount()` - Calculate pending tokens for release
- `getContractStatus()` - Get current lock/release status
- `checkReleaseStatus()` - Check if tokens can be released
- `getLockParameters()` - View all contract parameters
- `getProjectedReleases()` - Get 30-year projection data

### Owner-Only Functions
- `emergencyPause()` - Pause all releases
- `unpause()` - Resume releases
- `requestEmergencyWithdraw()` - Request emergency withdrawal
- `executeEmergencyWithdraw()` - Execute withdrawal (after 7-day delay)

## 🚀 Deployment

### Prerequisites
```bash
npm install
```

### Environment Setup
Create a `.env` file:
```env
BAK_TOKEN_ADDRESS=0x...          # BAK token contract address
VALIDATOR_REWARD_DISTRIBUTOR=0x... # Address receiving released tokens
START_TIME=1704067200            # Unix timestamp for lock start
PRIVATE_KEY=0x...                # Deployer private key
```

### Deploy to Local Network
```bash
# Start local Hardhat network
npx hardhat node

# Deploy contract
npx hardhat run scripts/deploy.js --network localhost
```

### Deploy to BrainArk Mainnet
```bash
npx hardhat run scripts/deploy.js --network brainark
```

## 🧪 Testing

Run comprehensive test suite:
```bash
npx hardhat test
```

## 📈 Usage Examples

### Check Release Status
```javascript
const status = await timeLock.checkReleaseStatus();
console.log("Can release:", status.canRelease_);
console.log("Amount available:", ethers.formatEther(status.releaseAmount));
```

### Trigger Monthly Release
```javascript
await timeLock.releaseTokens();
```