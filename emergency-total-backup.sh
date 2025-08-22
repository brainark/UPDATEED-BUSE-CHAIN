#!/bin/bash
# 🆘 EMERGENCY BACKUP SCRIPT - Run this NOW!
# This will create multiple backup copies of your critical data

echo "🆘 BRAINARK EMERGENCY BACKUP SYSTEM"
echo "=================================="
echo "Starting emergency backup to prevent total data loss..."

# Create backup directory with timestamp
BACKUP_DIR="/tmp/brainark-emergency-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 Backup directory: $BACKUP_DIR"

# 1. Backup ALL environment files (CRITICAL)
echo "🔑 Backing up environment files..."
mkdir -p "$BACKUP_DIR/env-files"
cp -r brainark-airdrop-dapp/.env* "$BACKUP_DIR/env-files/" 2>/dev/null

# 2. Backup smart contracts and deployment info  
echo "📜 Backing up contracts and deployments..."
mkdir -p "$BACKUP_DIR/contracts"
cp -r brainark-airdrop-dapp/contracts/ "$BACKUP_DIR/contracts/"
cp -r brainark-airdrop-dapp/artifacts/ "$BACKUP_DIR/contracts/" 2>/dev/null
cp -r brainark-airdrop-dapp/scripts/ "$BACKUP_DIR/contracts/"

# 3. Backup blockchain data (validators)
echo "⛓️  Backing up blockchain data..."
cp -r validators/ "$BACKUP_DIR/blockchain-data/" 2>/dev/null

# 4. Backup configuration files
echo "⚙️  Backing up configuration..."
mkdir -p "$BACKUP_DIR/config"
cp brainark-airdrop-dapp/hardhat.config.js "$BACKUP_DIR/config/"
cp brainark-airdrop-dapp/package.json "$BACKUP_DIR/config/"
cp -r brainark-airdrop-dapp/src/utils/ "$BACKUP_DIR/config/"

# 5. Create wallet recovery information
echo "💳 Creating wallet recovery info..."
cat > "$BACKUP_DIR/WALLET_RECOVERY_INFO.txt" << EOF
🔑 BRAINARK WALLET RECOVERY INFORMATION
=====================================
Generated: $(date)

⚠️  CRITICAL: This file contains sensitive information
🔒 Store this file securely and NEVER share it

DEPLOYED CONTRACT ADDRESSES:
- BrainArkEPOEnhanced: 0xdE04886D4e89f48F73c1684f2e610b25D561DD48
- BrainArkAirdrop: 0x1Df35D8e45E0192cD3C25B007a5417b2235642E5

NETWORK INFORMATION:
- Chain ID: 424242
- RPC URL: https://rpc.brainark.online
- Explorer: https://explorer.brainark.online

TREASURY WALLETS:
- ETH: 0xc9dE877a53f85BF51D76faed0C8c8842EFb35782
- USDT: 0x3A9ca3d316F2032d3a21741cBea2e047fd3C1145  
- USDC: 0xC13527f3bBAaf4cd726d07a78da9C5b74876527F
- BNB: 0x21FCcbB9b9b7c620BCbA61B6668C30F64C22859c

RECOVERY STEPS IF COMPUTER DIES:
1. Install Node.js and Git on new computer
2. Clone repository: git clone https://github.com/brainark/UPDATEED-BUSE-CHAIN.git
3. Restore environment files from this backup
4. Install dependencies: npm install
5. Your deployed contracts will still work with the backed-up private key

BACKUP LOCATION: $BACKUP_DIR
EOF

# 6. Create GitHub commit with current state
echo "📤 Committing current state to GitHub..."
git add -A
git commit -m "🆘 Emergency backup commit - $(date)"

# 7. Push to GitHub
echo "☁️  Pushing to GitHub..."
git push origin main

# 8. Create compressed backup
echo "📦 Creating compressed backup..."
tar -czf "$BACKUP_DIR.tar.gz" -C "$BACKUP_DIR" .

echo ""
echo "✅ EMERGENCY BACKUP COMPLETE!"
echo "============================="
echo "📍 Backup location: $BACKUP_DIR"
echo "📦 Compressed backup: $BACKUP_DIR.tar.gz"
echo "☁️  Code pushed to GitHub: https://github.com/brainark/UPDATEED-BUSE-CHAIN"
echo ""
echo "🔄 NEXT STEPS FOR RECOVERY:"
echo "1. Copy backup files to external drive/cloud storage"
echo "2. Write down your GitHub repository URL"
echo "3. Save this backup in multiple locations"
echo ""
echo "💾 TO ACCESS FROM NEW COMPUTER:"
echo "1. git clone https://github.com/brainark/UPDATEED-BUSE-CHAIN.git"
echo "2. Restore .env files from backup"
echo "3. npm install && npm run build"
echo "4. Your contracts are already deployed and working!"

# 9. Display critical recovery information
echo ""
echo "🔑 WRITE THIS DOWN ON PAPER (in case all digital backups fail):"
echo "Repository: https://github.com/brainark/UPDATEED-BUSE-CHAIN"
echo "EPO Contract: 0xdE04886D4e89f48F73c1684f2e610b25D561DD48"
echo "Airdrop Contract: 0x1Df35D8e45E0192cD3C25B007a5417b2235642E5"
echo "Chain ID: 424242"
echo "RPC: https://rpc.brainark.online"
