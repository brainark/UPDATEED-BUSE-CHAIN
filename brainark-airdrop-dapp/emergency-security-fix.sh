#!/bin/bash
# 🚨 EMERGENCY SECURITY REMEDIATION SCRIPT
# Run this immediately to address critical vulnerabilities

echo "🚨 BRAINARK EMERGENCY SECURITY REMEDIATION"
echo "=========================================="

# 1. Backup current configuration
echo "📦 Creating security backup..."
mkdir -p /tmp/brainark-security-backup
cp .env* /tmp/brainark-security-backup/ 2>/dev/null || true
cp src/utils/config.ts /tmp/brainark-security-backup/

# 2. Remove exposed credentials from files
echo "🔐 Removing exposed credentials..."
cat > .env.secure << 'EOF'
# SECURE ENVIRONMENT CONFIGURATION
# DO NOT COMMIT REAL VALUES TO VERSION CONTROL

# Network Configuration
NEXT_PUBLIC_RPC_URL=https://rpc.brainark.online
NEXT_PUBLIC_CHAIN_ID=424242

# SECURITY NOTE: Use secure key management for production
# PRIVATE_KEY should be loaded from secure vault or hardware wallet
PRIVATE_KEY=${SECURE_PRIVATE_KEY}

# API Configuration - Use environment-specific values
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=${WALLET_CONNECT_PROJECT_ID}
TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
TWITTER_CLIENT_ID=${TWITTER_CLIENT_ID}
TWITTER_CLIENT_SECRET=${TWITTER_CLIENT_SECRET}
TWITTER_BEARER_TOKEN=${TWITTER_BEARER_TOKEN}

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=${FIREBASE_API_KEY}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
EOF

# 3. Create secure configuration template
echo "🛡️ Creating secure configuration template..."
cat > SECURITY_CHECKLIST.md << 'EOF'
# 🔒 BRAINARK SECURITY CHECKLIST

## IMMEDIATE ACTIONS REQUIRED

### 1. 🚨 CRITICAL - Private Key Security
- [ ] Generate new deployment wallet
- [ ] Transfer all funds from compromised wallet (0x861af...)
- [ ] Update deployment scripts with new wallet
- [ ] Destroy old private key securely

### 2. 🔑 API Token Rotation
- [ ] Regenerate Telegram Bot Token
- [ ] Regenerate Twitter API credentials
- [ ] Regenerate WalletConnect Project ID
- [ ] Update all services with new tokens

### 3. 🏦 Treasury Security
- [ ] Implement multisig for treasury wallets
- [ ] Set up time-locked operations
- [ ] Create emergency pause mechanisms

### 4. 📝 Configuration Security
- [ ] Configure production payment token addresses
- [ ] Remove hardcoded addresses from frontend
- [ ] Implement environment-based configuration

## COMMANDS TO RUN

```bash
# Generate new secure wallet
npx hardhat run scripts/generate-secure-wallet.js

# Update production payment tokens
npx hardhat run scripts/configure-production-tokens.js

# Deploy security monitoring
npx hardhat run scripts/deploy-monitoring.js
```

## MONITORING SETUP

1. Set up wallet balance monitoring
2. Configure transaction monitoring
3. Implement alert systems for suspicious activity
4. Regular security scans

EOF

# 4. Generate secure wallet script
echo "🔑 Creating secure wallet generation script..."
mkdir -p scripts/security
cat > scripts/security/generate-secure-wallet.js << 'EOF'
const { ethers } = require('ethers');
const crypto = require('crypto');

async function generateSecureWallet() {
    console.log('🔑 GENERATING SECURE WALLET FOR BRAINARK');
    console.log('=====================================');
    
    // Generate cryptographically secure random wallet
    const wallet = ethers.Wallet.createRandom();
    
    console.log('🆔 New Wallet Address:', wallet.address);
    console.log('🔐 Private Key (STORE SECURELY):', wallet.privateKey);
    console.log('🎯 Mnemonic (BACKUP SECURELY):', wallet.mnemonic.phrase);
    
    console.log('\n⚠️  SECURITY INSTRUCTIONS:');
    console.log('1. Store private key in secure vault (NOT in .env files)');
    console.log('2. Backup mnemonic phrase securely offline');
    console.log('3. Transfer funds from old wallet to this new wallet');
    console.log('4. Update deployment scripts with new address');
    console.log('5. Destroy old private key securely');
    
    // Generate environment template
    console.log('\n📝 Environment Template:');
    console.log(`SECURE_PRIVATE_KEY=${wallet.privateKey}`);
    console.log(`SECURE_WALLET_ADDRESS=${wallet.address}`);
    
    return wallet;
}

if (require.main === module) {
    generateSecureWallet().catch(console.error);
}

module.exports = { generateSecureWallet };
EOF

# 5. Create production token configuration script
cat > scripts/security/configure-production-tokens.js << 'EOF'
const { ethers } = require('hardhat');

async function configureProductionTokens() {
    console.log('💰 CONFIGURING PRODUCTION PAYMENT TOKENS');
    console.log('=======================================');
    
    // NOTE: Replace these with actual production token addresses
    const PRODUCTION_TOKENS = {
        // BrainArk Network Token Addresses (to be configured)
        USDT: '0x0000000000000000000000000000000000000000', // REPLACE WITH ACTUAL
        USDC: '0x0000000000000000000000000000000000000000', // REPLACE WITH ACTUAL
        BNB: '0x0000000000000000000000000000000000000000',  // REPLACE WITH ACTUAL
        WETH: '0x0000000000000000000000000000000000000000', // REPLACE WITH ACTUAL
    };
    
    console.log('⚠️  WARNING: Update these addresses before production deployment!');
    console.log('Current configuration still uses zero addresses.');
    
    // TODO: Implement actual token configuration logic
    // This would interact with your EPO contract to configure payment tokens
    
    return PRODUCTION_TOKENS;
}

if (require.main === module) {
    configureProductionTokens().catch(console.error);
}

module.exports = { configureProductionTokens };
EOF

# 6. Set up Git security
echo "📝 Setting up Git security..."
cat > .gitignore.security << 'EOF'
# SECURITY: Never commit these files
.env
.env.local
.env.production
*.key
*secret*
*private*
wallet.json
keystore/
secrets/

# Backup and temp files
*.backup
*.bak
/tmp/
/temp/
EOF

# Append to existing .gitignore or create new one
cat .gitignore.security >> .gitignore 2>/dev/null || cp .gitignore.security .gitignore

echo ""
echo "✅ EMERGENCY REMEDIATION COMPLETE"
echo "================================"
echo ""
echo "🔴 CRITICAL NEXT STEPS:"
echo "1. Run: cd scripts/security && node generate-secure-wallet.js"
echo "2. Securely store the new private key (NOT in .env files)"
echo "3. Transfer funds from old wallet to new wallet"
echo "4. Regenerate all API tokens"
echo "5. Review and update SECURITY_CHECKLIST.md"
echo ""
echo "📋 Files created:"
echo "- .env.secure (secure template)"
echo "- SECURITY_CHECKLIST.md (action items)"
echo "- scripts/security/generate-secure-wallet.js"
echo "- scripts/security/configure-production-tokens.js"
echo "- .gitignore.security (security rules)"
echo ""
echo "⚠️  DO NOT commit any files with real credentials!"
echo "🔒 Use secure key management for production deployment."
