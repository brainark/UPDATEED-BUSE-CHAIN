#!/bin/bash

# 🔄 BrainArk DApp Quick Restore Script
# Restores the working cross-chain EPO state

echo "🔄 BrainArk DApp Quick Restore"
echo "=============================="

BACKUP_DIR="/home/brainark/brainark_besu_chain/backups/20250909_131315_fixed_cross_chain_epo"
DAPP_DIR="/home/brainark/brainark_besu_chain/brainark-airdrop-dapp"

echo "📂 Backup Source: $BACKUP_DIR"
echo "🎯 Target Directory: $DAPP_DIR"
echo ""

# Confirm restore
read -p "⚠️  This will overwrite current dapp files. Continue? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ Restore cancelled"
    exit 1
fi

echo ""
echo "🔄 Restoring files..."

# Create backup of current state first
CURRENT_BACKUP="$DAPP_DIR/backup_before_restore_$(date +%Y%m%d_%H%M%S)"
echo "💾 Creating backup of current state: $CURRENT_BACKUP"
mkdir -p "$CURRENT_BACKUP"
cp -r "$DAPP_DIR/src" "$CURRENT_BACKUP/" 2>/dev/null
cp "$DAPP_DIR/.env.production" "$CURRENT_BACKUP/" 2>/dev/null

# Restore from backup
echo "📋 Restoring source code..."
cp -r "$BACKUP_DIR/src" "$DAPP_DIR/"

echo "📋 Restoring configuration files..."
cp "$BACKUP_DIR/.env.production" "$DAPP_DIR/"
cp "$BACKUP_DIR/.env.local" "$DAPP_DIR/" 2>/dev/null
cp "$BACKUP_DIR/package.json" "$DAPP_DIR/"
cp "$BACKUP_DIR/next.config.js" "$DAPP_DIR/"
cp "$BACKUP_DIR/hardhat.config.js" "$DAPP_DIR/"

echo ""
echo "✅ Local restore completed!"
echo ""

# Ask about production deployment
read -p "🌐 Deploy to production server? (y/N): " deploy
if [[ $deploy =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Deploying to production..."
    
    # Deploy key components
    sshpass -p "n8fXfH8C6Pu0c" scp -o StrictHostKeyChecking=no \
        "$DAPP_DIR/src/components/EnhancedEPOWithBondingCurve.tsx" \
        root@84.247.171.69:/var/www/brainark-dapp/src/components/
    
    sshpass -p "n8fXfH8C6Pu0c" scp -o StrictHostKeyChecking=no \
        "$DAPP_DIR/src/components/EnhancedEPOTradingPanel.tsx" \
        root@84.247.171.69:/var/www/brainark-dapp/src/components/
    
    sshpass -p "n8fXfH8C6Pu0c" scp -o StrictHostKeyChecking=no \
        "$DAPP_DIR/src/components/EnhancedNetworkSwitcher.tsx" \
        root@84.247.171.69:/var/www/brainark-dapp/src/components/
    
    sshpass -p "n8fXfH8C6Pu0c" scp -o StrictHostKeyChecking=no \
        "$DAPP_DIR/src/pages/api/epo-stats.ts" \
        root@84.247.171.69:/var/www/brainark-dapp/src/pages/api/
    
    echo "🔨 Building on production server..."
    sshpass -p "n8fXfH8C6Pu0c" ssh -o StrictHostKeyChecking=no \
        root@84.247.171.69 "cd /var/www/brainark-dapp && npm run build"
    
    echo "🔄 Restarting production service..."
    sshpass -p "n8fXfH8C6Pu0c" ssh -o StrictHostKeyChecking=no \
        root@84.247.171.69 "cd /var/www/brainark-dapp && pm2 restart brainark-dapp"
    
    echo "✅ Production deployment completed!"
fi

echo ""
echo "🎉 Restore Process Complete!"
echo ""
echo "📋 Summary:"
echo "  ✅ Fixed RPC endpoints (BSC, Ethereum, Polygon)"
echo "  ✅ Fixed cross-chain payment flow"
echo "  ✅ Fixed EPO active status"
echo "  ✅ Fixed network mismatch blocking"
echo ""
echo "🌐 Test at: https://dapp.brainark.online"
echo "🔍 Local dev: cd $DAPP_DIR && npm run dev"
echo ""