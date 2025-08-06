#!/bin/bash

echo "🚀 Deploying Updated React Explorer to Public Server"
echo "=================================================="

# Configuration
PUBLIC_SERVER="84.247.171.69"
REMOTE_USER="root"
REMOTE_PATH="/var/www/explorer.brainark.online"
LOCAL_BUILD_PATH="/home/brainark/brainark_besu_chain/react-explorer/build"

echo "📦 Preparing deployment..."
echo "Local build path: $LOCAL_BUILD_PATH"
echo "Remote server: $PUBLIC_SERVER"
echo "Remote path: $REMOTE_PATH"

# Check if build directory exists
if [ ! -d "$LOCAL_BUILD_PATH" ]; then
    echo "❌ Build directory not found. Please run 'npm run build' first."
    exit 1
fi

echo "📋 Build contents:"
ls -la "$LOCAL_BUILD_PATH"

echo ""
echo "🔄 Deploying to public server..."

# Create backup of current deployment
echo "📦 Creating backup on remote server..."
ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$PUBLIC_SERVER" "
    if [ -d '$REMOTE_PATH' ]; then
        cp -r '$REMOTE_PATH' '${REMOTE_PATH}_backup_$(date +%Y%m%d_%H%M%S)'
        echo '✅ Backup created'
    fi
    mkdir -p '$REMOTE_PATH'
"

# Upload the new build
echo "⬆️ Uploading React build files..."
scp -o StrictHostKeyChecking=no -r "$LOCAL_BUILD_PATH"/* "$REMOTE_USER@$PUBLIC_SERVER:$REMOTE_PATH/"

if [ $? -eq 0 ]; then
    echo "✅ Files uploaded successfully!"
    
    # Set proper permissions
    echo "🔧 Setting proper permissions..."
    ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$PUBLIC_SERVER" "
        chown -R www-data:www-data '$REMOTE_PATH'
        chmod -R 755 '$REMOTE_PATH'
        echo '✅ Permissions set'
    "
    
    # Test the deployment
    echo "🧪 Testing deployment..."
    RESPONSE=$(ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$PUBLIC_SERVER" "curl -s -o /dev/null -w '%{http_code}' http://localhost/")
    
    if [ "$RESPONSE" = "200" ]; then
        echo "✅ Deployment successful! Explorer should be accessible at http://explorer.brainark.online"
    else
        echo "⚠️ Deployment completed but HTTP test returned: $RESPONSE"
        echo "Please check the web server configuration."
    fi
    
    echo ""
    echo "🎉 React Explorer deployment completed!"
    echo "🌐 URL: http://explorer.brainark.online"
    echo "📊 The explorer is now using RPC: https://rpc.brainark.online"
    
else
    echo "❌ Deployment failed!"
    exit 1
fi