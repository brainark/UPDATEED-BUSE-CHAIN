#!/bin/bash
# Add Oracle Configuration to Encrypted Environment File
# This script safely adds the oracle private key to your existing encrypted environment

set -e

# Configuration
ENV_FILE=".env.production"
ENC_FILE="${ENV_FILE}.enc"
TEMP_ENV_FILE="${ENV_FILE}.tmp"
BACKUP_FILE="${ENC_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

# Oracle wallet details (generated earlier)
ORACLE_PRIVATE_KEY="0x15e21b4b4d7e32df9ce839a9a3b71c0b0010879f95a6a9e6ffdef9a3f8b8908a"
ORACLE_ADDRESS="0xc74CC2004e40ae32DD5ED5c74043422DA3892722"

echo "🔐 Adding Oracle Configuration to Encrypted Environment"
echo "======================================================="

# Check if the encrypted file exists
if [ ! -f "$ENC_FILE" ]; then
    echo "❌ Error: Encrypted environment file '$ENC_FILE' not found!"
    exit 1
fi

# Create backup of existing encrypted file
echo "📋 Creating backup of existing encrypted environment..."
cp "$ENC_FILE" "$BACKUP_FILE"
echo "✅ Backup created: $BACKUP_FILE"

# Function to cleanup temporary files on exit
cleanup() {
    echo "🧹 Cleaning up temporary files..."
    if [ -f "$TEMP_ENV_FILE" ]; then
        shred -u "$TEMP_ENV_FILE" 2>/dev/null || rm -f "$TEMP_ENV_FILE"
    fi
    if [ -f "${TEMP_ENV_FILE}.new" ]; then
        shred -u "${TEMP_ENV_FILE}.new" 2>/dev/null || rm -f "${TEMP_ENV_FILE}.new"
    fi
}

# Register cleanup function to run on script exit
trap cleanup EXIT

# Decrypt the existing environment file
echo "🔓 Decrypting existing environment file..."
echo "Enter the decryption password for existing environment:"

if ! openssl enc -aes-256-cbc -d -salt -pbkdf2 -in "$ENC_FILE" -out "$TEMP_ENV_FILE"; then
    echo "❌ Decryption failed! Incorrect password or corrupted file."
    exit 1
fi

echo "✅ Existing environment file decrypted successfully!"

# Create new environment file with oracle configuration
echo "🔧 Adding Oracle configuration..."

# Add oracle configuration to the environment
cat >> "$TEMP_ENV_FILE" << EOF

# ============================================================================
# Oracle Configuration (Added $(date))
# For Cross-Chain EPO Payment Processing
# ============================================================================

# Oracle Wallet (Generated for cross-chain operations)
ORACLE_PRIVATE_KEY=$ORACLE_PRIVATE_KEY
ORACLE_ADDRESS=$ORACLE_ADDRESS

# Cross-Chain EPO Contract (Update after deployment)
CROSS_CHAIN_EPO_ADDRESS=0x... # Deploy BrainArkEPOCrossChain and update this

# Treasury Addresses for Multi-Chain Payments
ETHEREUM_TREASURY=0x742d35Cc6634C0532925a3b8D0C9bd0D8f05B89C
BSC_TREASURY=0x742d35Cc6634C0532925a3b8D0C9bd0D8f05B89C
POLYGON_TREASURY=0x742d35Cc6634C0532925a3b8D0C9bd0D8f05B89C

# Cross-Chain Payment Settings
NEXT_PUBLIC_ENABLE_CROSS_CHAIN=true
BAK_PRICE_USD=0.02

# API Security
API_SECRET_KEY=$(openssl rand -hex 32)
EOF

echo "✅ Oracle configuration added to environment file!"

# Re-encrypt the updated environment file
echo "🔐 Re-encrypting environment file with Oracle configuration..."
echo "Enter the password to encrypt the updated environment file:"

if ! openssl enc -aes-256-cbc -salt -pbkdf2 -in "$TEMP_ENV_FILE" -out "$ENC_FILE"; then
    echo "❌ Re-encryption failed!"
    echo "🔄 Restoring backup..."
    cp "$BACKUP_FILE" "$ENC_FILE"
    exit 1
fi

echo "✅ Environment file re-encrypted successfully!"

# Show summary
echo ""
echo "📊 Summary of Changes:"
echo "======================"
echo "✅ Oracle Private Key: Added"
echo "✅ Oracle Address: $ORACLE_ADDRESS"
echo "✅ Treasury Addresses: Configured for Ethereum, BSC, Polygon"
echo "✅ Cross-Chain Settings: Enabled"
echo "✅ API Security Key: Generated randomly"
echo "✅ Backup Created: $BACKUP_FILE"

echo ""
echo "🚀 Next Steps:"
echo "=============="
echo "1. Deploy BrainArkEPOCrossChain contract"
echo "2. Update CROSS_CHAIN_EPO_ADDRESS in encrypted environment"
echo "3. Fund oracle wallet with BAK for gas fees:"
echo "   Address: $ORACLE_ADDRESS"
echo "   Recommended: 1000 BAK"
echo "4. Add oracle as authorized in your contract:"
echo "   Call: setAuthorizedOracle(\"$ORACLE_ADDRESS\", true)"
echo "5. Test cross-chain payments on testnet first"

echo ""
echo "🔒 Security Reminders:"
echo "====================="
echo "• Backup file saved as: $BACKUP_FILE"
echo "• Keep encryption password secure"
echo "• Never expose private keys"
echo "• Monitor oracle wallet balance"
echo "• Use hardware wallet for production treasury"

echo ""
echo "✅ Oracle configuration successfully added to encrypted environment!"
echo "🔐 Your environment remains encrypted and secure."