#!/bin/bash
# Safe environment loader for BrainArk DApp
# Decrypts environment file temporarily, loads variables, then removes the decrypted file

set -e

# Configuration
ENV_FILE=".env.production"
ENC_FILE="${ENV_FILE}.enc"
TEMP_ENV_FILE="${ENV_FILE}.tmp"

# Check if the encrypted file exists
if [ ! -f "$ENC_FILE" ]; then
    echo "❌ Error: Encrypted environment file '$ENC_FILE' not found!"
    exit 1
fi

# Function to cleanup temporary files on exit
cleanup() {
    echo "🧹 Cleaning up temporary files..."
    if [ -f "$TEMP_ENV_FILE" ]; then
        shred -u "$TEMP_ENV_FILE" 2>/dev/null || rm -f "$TEMP_ENV_FILE"
    fi
}

# Register cleanup function to run on script exit
trap cleanup EXIT

# Decrypt the environment file to a temporary location
echo "🔓 Decrypting environment file..."
echo "Enter the decryption password:"

openssl enc -aes-256-cbc -d -salt -pbkdf2 -in "$ENC_FILE" -out "$TEMP_ENV_FILE"

# Check if decryption was successful
if [ $? -ne 0 ] || [ ! -f "$TEMP_ENV_FILE" ]; then
    echo "❌ Decryption failed! Incorrect password or corrupted file."
    exit 1
fi

echo "✅ Environment file decrypted successfully!"

# Source the environment variables
echo "🔄 Loading environment variables..."
export $(grep -v '^#' "$TEMP_ENV_FILE" | xargs)

# Verify that some key variables are loaded
if [ -z "$NEXT_PUBLIC_NETWORK_ENV" ] || [ -z "$NEXT_PUBLIC_RPC_URL" ]; then
    echo "⚠️ Warning: Some essential environment variables might not be loaded properly."
else
    echo "✅ Environment variables loaded successfully!"
fi

# Execute the provided command with the loaded environment
if [ "$#" -gt 0 ]; then
    echo "🚀 Executing command: $@"
    exec "$@"
else
    echo "ℹ️ Environment loaded. No command specified to execute."
    echo "   To run a command with these environment variables, use:"
    echo "   $0 your-command-here"
fi
