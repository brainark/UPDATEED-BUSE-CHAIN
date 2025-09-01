#!/bin/bash

# BrainArk Logo Preparation Script
# This script helps prepare your logo for CoinMarketCap, CoinGecko, and MetaMask submissions

echo "🎨 BrainArk Logo Preparation Script"
echo "=================================="

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "⚠️ ImageMagick not found. Installing..."
    sudo apt update && sudo apt install imagemagick -y
fi

# Set source logo path (update this with your actual path)
SOURCE_LOGO="./brainark-original-logo.jpg"

echo "📋 Logo Requirements for Each Platform:"
echo "• CoinMarketCap: 256x256px PNG/SVG, transparent background"
echo "• CoinGecko: 256x256px PNG/SVG, transparent background" 
echo "• MetaMask: SVG preferred, PNG acceptable, transparent"
echo ""

# Check if source logo exists
if [ ! -f "$SOURCE_LOGO" ]; then
    echo "❌ Source logo not found at: $SOURCE_LOGO"
    echo "Please copy your logo file to:"
    echo "   ./brainark-original-logo.jpg"
    echo ""
    echo "From Windows, you can copy using:"
    echo '   copy "c:\Users\USER\OneDrive\Bilder\IMG-20250803-WA0004.jpg" .'
    echo ""
    exit 1
fi

echo "✅ Source logo found: $SOURCE_LOGO"
echo ""

# Create output directory
mkdir -p ./logos

# Generate different sizes and formats
echo "🔄 Processing logo..."

# Create 256x256 PNG with transparent background (primary)
echo "  • Creating 256x256 PNG..."
convert "$SOURCE_LOGO" \
    -resize 256x256 \
    -background none \
    -gravity center \
    -extent 256x256 \
    ./logos/brainark-256.png

# Create 128x128 PNG 
echo "  • Creating 128x128 PNG..."
convert "$SOURCE_LOGO" \
    -resize 128x128 \
    -background none \
    -gravity center \
    -extent 128x128 \
    ./logos/brainark-128.png

# Create 64x64 PNG
echo "  • Creating 64x64 PNG..."
convert "$SOURCE_LOGO" \
    -resize 64x64 \
    -background none \
    -gravity center \
    -extent 64x64 \
    ./logos/brainark-64.png

# Create 32x32 PNG (favicon size)
echo "  • Creating 32x32 PNG..."
convert "$SOURCE_LOGO" \
    -resize 32x32 \
    -background none \
    -gravity center \
    -extent 32x32 \
    ./logos/brainark-32.png

# Copy main logo for easy reference
cp ./logos/brainark-256.png ./logos/brainark.png
cp ./logos/brainark-256.png ./public/brainark-logo.png 2>/dev/null || echo "  ℹ️ No public directory found"

echo ""
echo "✅ Logo processing complete!"
echo ""
echo "📁 Generated Files:"
echo "  • ./logos/brainark-256.png (Primary - use for all platforms)"
echo "  • ./logos/brainark-128.png"
echo "  • ./logos/brainark-64.png" 
echo "  • ./logos/brainark-32.png"
echo "  • ./logos/brainark.png (Copy of 256px version)"
echo ""

echo "📋 Next Steps:"
echo "1. Review the generated logos in ./logos/ directory"
echo "2. Use brainark-256.png for CoinMarketCap submission"
echo "3. Use brainark-256.png for CoinGecko submission" 
echo "4. For MetaMask, convert to SVG if needed:"
echo "   • Online tools: https://convertio.co/png-svg/"
echo "   • Or use: convert brainark-256.png brainark.svg"
echo ""

echo "🚀 Your logos are ready for platform submissions!"
echo ""
echo "Platform Submission Links:"
echo "• CoinMarketCap: https://coinmarketcap.com/request/"
echo "• CoinGecko: https://www.coingecko.com/request-form"
echo "• MetaMask: https://github.com/MetaMask/contract-metadata"