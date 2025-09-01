#!/bin/bash
# deploy-updated-dapp.sh

cd /home/brainark/brainark_besu_chain/brainark-airdrop-dapp

echo "🔧 Deploying updated BrainArk dApp..."

# 1. Make sure we have the latest env variables
echo "📝 Confirming environment variables..."
if ! grep -q "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=0a1cdc678a1869275bb663eaf7eba7bb" .env.local; then
  echo "Adding WalletConnect Project ID to .env.local"
  echo "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=0a1cdc678a1869275bb663eaf7eba7bb" >> .env.local
fi

# 2. Build the application
echo "🏗️  Building application..."
npm run build

# 3. Deploy to server
echo "🚀 Deploying to server..."
rsync -avz --delete out/ root@84.247.171.69:/var/www/dapp.brainark.online/

# 4. Set permissions
echo "🔒 Setting permissions..."
ssh root@84.247.171.69 "chown -R www-data:www-data /var/www/dapp.brainark.online/ && chmod -R 755 /var/www/dapp.brainark.online/"

# 5. Reload nginx
echo "🔄 Reloading web server..."
ssh root@84.247.171.69 "nginx -s reload"

echo "✅ Deployment complete!"
echo "🌐 Your dApp is now live at https://dapp.brainark.online/"
echo "💡 Clear your browser cache (Ctrl+F5) to see the changes"
