#!/bin/bash

# BrainArk Coin Transfer Script
echo "🚀 BrainArk Coin Transfer"
echo "========================"

# Configuration
RPC_URL="http://localhost:8545"
FROM_ADDRESS="0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169"
TO_ADDRESS="0xCa40038566b915f6b1C6683Fd626C3EcB0e5471E"
AMOUNT="0x56BC75E2D630E0000"  # 100 ETH in hex (100 * 10^18)

echo "From: $FROM_ADDRESS"
echo "To: $TO_ADDRESS"
echo "Amount: 100 BAK"
echo ""

# Check current balances
echo "📊 Checking current balances..."

echo "From balance:"
curl -X POST -H "Content-Type: application/json" \
  --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"$FROM_ADDRESS\",\"latest\"],\"id\":1}" \
  $RPC_URL | jq -r '.result' | xargs -I {} node -e "console.log(parseInt('{}', 16) / Math.pow(10, 18) + ' BAK')"

echo "To balance:"
curl -X POST -H "Content-Type: application/json" \
  --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"$TO_ADDRESS\",\"latest\"],\"id\":1}" \
  $RPC_URL | jq -r '.result' | xargs -I {} node -e "console.log(parseInt('{}', 16) / Math.pow(10, 18) + ' BAK')"

echo ""

# Get nonce
echo "📝 Getting transaction nonce..."
NONCE=$(curl -s -X POST -H "Content-Type: application/json" \
  --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getTransactionCount\",\"params\":[\"$FROM_ADDRESS\",\"latest\"],\"id\":1}" \
  $RPC_URL | jq -r '.result')

echo "Nonce: $NONCE"

# Get gas price
echo "⛽ Getting gas price..."
GAS_PRICE=$(curl -s -X POST -H "Content-Type: application/json" \
  --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_gasPrice\",\"params\":[],\"id\":1}" \
  $RPC_URL | jq -r '.result')

echo "Gas Price: $GAS_PRICE"
echo ""

echo "❌ IMPORTANT: This script requires the private key for signing!"
echo ""
echo "🔑 To complete the transfer, you need to:"
echo "1. Find the private key for address: $FROM_ADDRESS"
echo "2. Use the Node.js script with the private key"
echo "3. Or import the account into MetaMask and send manually"
echo ""
echo "💡 Alternative methods:"
echo "1. Use the send_transaction.js script with proper private key"
echo "2. Import account into MetaMask and send via UI"
echo "3. Use your blockchain explorer's send function"
echo ""

# Show the transaction data that would be sent
echo "📋 Transaction data (for reference):"
echo "{"
echo "  \"from\": \"$FROM_ADDRESS\","
echo "  \"to\": \"$TO_ADDRESS\","
echo "  \"value\": \"$AMOUNT\","
echo "  \"gas\": \"0x5208\","
echo "  \"gasPrice\": \"$GAS_PRICE\","
echo "  \"nonce\": \"$NONCE\","
echo "  \"chainId\": \"0x67932\""
echo "}"