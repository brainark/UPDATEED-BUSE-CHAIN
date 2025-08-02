#!/bin/bash

echo "🚀 BrainArk Explorer Deployment Script"
echo "======================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📋 Choose deployment option:"
echo "1. Deploy React Explorer (Recommended)"
echo "2. Deploy Simple HTML Explorer"
echo "3. Deploy Both"
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "🔨 Building and deploying React Explorer..."
        cd react-explorer
        npm run build
        vercel --prod
        ;;
    2)
        echo "🔨 Deploying Simple HTML Explorer..."
        cd brainarkblock-explorer
        vercel --prod
        ;;
    3)
        echo "🔨 Deploying both explorers..."
        
        echo "📦 Building React Explorer..."
        cd react-explorer
        npm run build
        vercel --prod
        cd ..
        
        echo "📦 Deploying HTML Explorer..."
        cd brainarkblock-explorer
        vercel --prod
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📝 Next steps:"
echo "1. Go to your Vercel dashboard"
echo "2. Add your custom domain in Settings → Domains"
echo "3. Configure DNS records with your domain provider"
echo "4. Update the EXPLORER_URL in config.js if needed"
echo ""
echo "🌐 Recommended domain setup:"
echo "   - React Explorer: explorer.yourdomain.com"
echo "   - HTML Explorer: simple-explorer.yourdomain.com"