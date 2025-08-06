#!/bin/bash

echo "🧠 BrainArk React Explorer - Local Test"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in react-explorer directory"
    echo "Please run: cd react-explorer && ./test-local.sh"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🚀 Starting React development server..."
echo ""
echo "📋 Testing Instructions:"
echo "1. The app will open at http://localhost:3001"
echo "2. For production network: http://localhost:3001?network=production"
echo "3. For local network: http://localhost:3001?network=local"
echo ""
echo "🔧 Current Issues Fixed:"
echo "✅ Lightened dark theme"
echo "✅ Fixed WalletConnect CSP violations"
echo "✅ Reduced wallet provider conflict warnings"
echo ""
echo "⚠️  Chain ID Note:"
echo "- Your MetaMask is on production BrainArk (0x67932)"
echo "- Local app expects local network (0x7a69)"
echo "- Use the switch button or add ?network=production to URL"
echo ""

# Start the development server
npm start