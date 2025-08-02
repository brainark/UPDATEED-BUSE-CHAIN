#!/bin/bash

# BrainArk Solana Treasury Wallet Generation Script
# This script generates Solana wallets using the official Solana CLI (SAFEST METHOD)

echo "🌟 Generating Solana Treasury Wallets for BrainArk Bridge"
echo "============================================================"

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Installing..."
    echo "Run this command to install Solana CLI:"
    echo "sh -c \"\$(curl -sSfL https://release.solana.com/v1.17.0/install)\""
    echo ""
    echo "After installation, run this script again."
    exit 1
fi

echo "✅ Solana CLI found. Generating wallets..."
echo ""

# Create wallets directory if it doesn't exist
mkdir -p wallets/solana

# Generate Solana treasury wallets
echo "📦 Generating Solana Main Treasury Wallet..."
solana-keygen new --outfile wallets/solana/main_treasury.json --no-bip39-passphrase --silent
MAIN_TREASURY=$(solana-keygen pubkey wallets/solana/main_treasury.json)
echo "Address: $MAIN_TREASURY"
echo ""

echo "📦 Generating Solana Bridge Wallet..."
solana-keygen new --outfile wallets/solana/bridge_wallet.json --no-bip39-passphrase --silent
BRIDGE_WALLET=$(solana-keygen pubkey wallets/solana/bridge_wallet.json)
echo "Address: $BRIDGE_WALLET"
echo ""

echo "📦 Generating Solana Hot Wallet (for operations)..."
solana-keygen new --outfile wallets/solana/hot_wallet.json --no-bip39-passphrase --silent
HOT_WALLET=$(solana-keygen pubkey wallets/solana/hot_wallet.json)
echo "Address: $HOT_WALLET"
echo ""

echo "📦 Generating Solana Cold Storage Wallet..."
solana-keygen new --outfile wallets/solana/cold_storage.json --no-bip39-passphrase --silent
COLD_STORAGE=$(solana-keygen pubkey wallets/solana/cold_storage.json)
echo "Address: $COLD_STORAGE"
echo ""

# Display summary
echo "============================================================"
echo "📋 SOLANA WALLET GENERATION SUMMARY"
echo "============================================================"
echo "Main Treasury:    $MAIN_TREASURY"
echo "Bridge Wallet:    $BRIDGE_WALLET"
echo "Hot Wallet:       $HOT_WALLET"
echo "Cold Storage:     $COLD_STORAGE"
echo ""

# Generate environment variables
echo "============================================================"
echo "📝 ENVIRONMENT VARIABLES"
echo "============================================================"
echo "# Add these to your .env.local file:"
echo "NEXT_PUBLIC_SOLANA_MAIN_TREASURY=$MAIN_TREASURY"
echo "NEXT_PUBLIC_SOLANA_BRIDGE_WALLET=$BRIDGE_WALLET"
echo "NEXT_PUBLIC_SOLANA_HOT_WALLET=$HOT_WALLET"
echo "NEXT_PUBLIC_SOLANA_COLD_STORAGE=$COLD_STORAGE"
echo ""

# Generate bridge configuration
echo "============================================================"
echo "🌉 BRIDGE CONFIGURATION"
echo "============================================================"
echo "// Solana bridge configuration for your bridge service:"
echo "export const SOLANA_CONFIG = {"
echo "  mainTreasury: '$MAIN_TREASURY',"
echo "  bridgeWallet: '$BRIDGE_WALLET',"
echo "  hotWallet: '$HOT_WALLET',"
echo "  coldStorage: '$COLD_STORAGE',"
echo "  network: 'mainnet-beta', // or 'devnet' for testing"
echo "  rpcUrl: 'https://api.mainnet-beta.solana.com'"
echo "} as const"
echo ""

# Security instructions
echo "============================================================"
echo "🔒 SECURITY INSTRUCTIONS"
echo "============================================================"
echo "1. Wallet files are stored in: ./wallets/solana/"
echo "2. BACKUP these JSON files to multiple secure locations"
echo "3. NEVER commit wallet files to version control"
echo "4. Consider using hardware wallets for cold storage"
echo "5. Use hot wallet only for automated operations"
echo "6. Keep majority of funds in cold storage"
echo ""

# File permissions
echo "🔐 Setting secure file permissions..."
chmod 600 wallets/solana/*.json
echo "✅ Wallet files secured (600 permissions)"
echo ""

# Backup instructions
echo "============================================================"
echo "💾 BACKUP INSTRUCTIONS"
echo "============================================================"
echo "1. Copy wallet files to secure backup location:"
echo "   cp -r wallets/solana /path/to/secure/backup/"
echo ""
echo "2. Create encrypted backup:"
echo "   tar -czf solana_wallets_backup.tar.gz wallets/solana/"
echo "   gpg -c solana_wallets_backup.tar.gz"
echo ""
echo "3. Store encrypted backup in multiple locations"
echo ""

# Next steps
echo "============================================================"
echo "📋 NEXT STEPS"
echo "============================================================"
echo "1. Backup wallet files securely"
echo "2. Fund wallets with SOL for transaction fees"
echo "3. Set up Solana bridge service"
echo "4. Configure bridge monitoring"
echo "5. Test bridge with small amounts"
echo ""

echo "🎉 Solana wallets generated successfully using Solana CLI!"
echo "Wallet files location: ./wallets/solana/"