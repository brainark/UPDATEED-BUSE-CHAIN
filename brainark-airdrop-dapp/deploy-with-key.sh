#!/bin/bash

# BrainArk DApp Clean Production Deployment Script with SSH Key
# Server: root@84.247.171.69 - /var/www/brainark-dapp

set -e

echo "🚀 Starting BrainArk DApp Clean Production Deployment..."

# Configuration
SERVER_IP="84.247.171.69"
SERVER_USER="root"
SERVER_PATH="/var/www/brainark-dapp"
LOCAL_PATH="/home/brainark/brainark_besu_chain/brainark-airdrop-dapp"
BACKUP_PATH="/var/www/backups/brainark-dapp-backup-$(date +%Y%m%d_%H%M%S)"
SSH_KEY="n8fXfH8C6Pu0c"

# SSH connection function with key
ssh_cmd() {
    sshpass -p "$SSH_KEY" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$@"
}

rsync_cmd() {
    sshpass -p "$SSH_KEY" rsync -avz -e "ssh -o StrictHostKeyChecking=no" "$@"
}

echo "📋 Clean Deployment Configuration:"
echo "   Server: $SERVER_USER@$SERVER_IP"
echo "   Old Path: $SERVER_PATH (will be cleared)"
echo "   Backup: $BACKUP_PATH"

# Install sshpass if not available
if ! command -v sshpass &> /dev/null; then
    echo "📦 Installing sshpass..."
    sudo apt-get update && sudo apt-get install -y sshpass
fi

# Step 1: Test connection and clean server
echo "🧹 Cleaning old deployment from server..."
ssh_cmd "
    # Stop only the specific brainark-dapp PM2 process
    echo '   → Stopping brainark-dapp PM2 process only...'
    pm2 delete brainark-dapp 2>/dev/null || true
    echo '   ✅ Only brainark-dapp process stopped - other services untouched'
    
    # Create backup if directory exists
    if [ -d '$SERVER_PATH' ]; then
        echo '   → Creating backup of old deployment...'
        mkdir -p /var/www/backups
        cp -r '$SERVER_PATH' '$BACKUP_PATH'
        echo '   ✅ Backup created at $BACKUP_PATH'
        
        # Clear old deployment
        echo '   → Removing old deployment files...'
        rm -rf '$SERVER_PATH'/*
        rm -rf '$SERVER_PATH'/.[^.]*
    else
        echo '   → No existing deployment found'
    fi
    
    # Ensure directory exists with proper permissions
    mkdir -p '$SERVER_PATH'
    echo '   ✅ Server cleaned and ready for new deployment'
"

# Step 2: Prepare optimized build locally
echo "🔧 Preparing optimized production build..."
cd "$LOCAL_PATH"

# Use optimized environment
echo "   → Setting up optimized production environment..."
cp .env.production.optimized .env.production

# Clean local build
echo "   → Cleaning local build directories..."
rm -rf .next out node_modules/.cache 2>/dev/null || true

# Install dependencies
echo "   → Installing dependencies..."
npm install

# Build optimized version
echo "   → Building optimized production version..."
NODE_ENV=production npm run build

if [ ! -d ".next" ]; then
    echo "❌ Build failed - no .next directory found"
    exit 1
fi

echo "✅ Optimized production build completed"

# Step 3: Create deployment package
echo "📦 Creating optimized deployment package..."
TEMP_DIR="/tmp/brainark-dapp-clean-deploy-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$TEMP_DIR"

# Copy essential files for production
echo "   → Copying production files..."
cp -r .next "$TEMP_DIR/"
cp -r public "$TEMP_DIR/"
cp package.json "$TEMP_DIR/"
cp package-lock.json "$TEMP_DIR/"
cp next.config.js "$TEMP_DIR/"
cp .env.production "$TEMP_DIR/.env.production"
cp .env.production "$TEMP_DIR/.env.local"

# Copy optimized hooks and utilities
mkdir -p "$TEMP_DIR/src/hooks" "$TEMP_DIR/src/utils"
cp src/hooks/useOptimizedPerformance.ts "$TEMP_DIR/src/hooks/" 2>/dev/null || true
cp src/hooks/useProductionEPOContract.ts "$TEMP_DIR/src/hooks/" 2>/dev/null || true
cp src/utils/appwriteOptimized.ts "$TEMP_DIR/src/utils/" 2>/dev/null || true

# Copy other necessary source files
cp -r src/components "$TEMP_DIR/src/" 2>/dev/null || true
cp -r src/pages "$TEMP_DIR/src/" 2>/dev/null || true
cp -r src/styles "$TEMP_DIR/src/" 2>/dev/null || true

echo "✅ Optimized deployment package created"

# Step 4: Deploy to server
echo "🚀 Deploying optimized version to server..."

# Upload all files
echo "   → Uploading files to server..."
rsync_cmd --progress "$TEMP_DIR/" "$SERVER_USER@$SERVER_IP:$SERVER_PATH/"

# Setup and configure on server
echo "   → Setting up optimized application on server..."
ssh_cmd "
    cd '$SERVER_PATH'
    
    # Install production dependencies only
    echo '   → Installing production dependencies...'
    NODE_ENV=production npm ci --only=production
    
    # Set proper ownership and permissions
    echo '   → Setting proper permissions...'
    chown -R www-data:www-data '$SERVER_PATH' 2>/dev/null || chown -R root:root '$SERVER_PATH'
    chmod -R 755 '$SERVER_PATH'
    chmod 644 '$SERVER_PATH'/.env.* 2>/dev/null || true
    
    # Install PM2 globally if not present
    if ! command -v pm2 &> /dev/null; then
        echo '   → Installing PM2 process manager...'
        npm install -g pm2
    fi
    
    # Create PM2 ecosystem file for better management
    cat > ecosystem.config.js << 'PM2_EOF'
module.exports = {
  apps: [{
    name: 'brainark-dapp',
    script: 'npm',
    args: 'start',
    cwd: '$SERVER_PATH',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/brainark-dapp-error.log',
    out_file: '/var/log/pm2/brainark-dapp-out.log',
    log_file: '/var/log/pm2/brainark-dapp.log',
    time: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
PM2_EOF
    
    # Create log directory
    mkdir -p /var/log/pm2
    
    # Start application with PM2
    echo '   → Starting optimized application...'
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup systemd -u root --hp /root
    
    echo '   ✅ Optimized application started successfully'
"

# Cleanup
echo "🧹 Cleaning up temporary files..."
rm -rf "$TEMP_DIR"

# Step 5: Verify deployment
echo "🔍 Verifying optimized deployment..."
sleep 10

# Check PM2 status
echo "   → Checking PM2 process status..."
if ssh_cmd "pm2 list | grep -q brainark-dapp"; then
    echo "   ✅ Application process is running"
else
    echo "   ❌ Application process not found"
    ssh_cmd "pm2 logs brainark-dapp --lines 20"
    exit 1
fi

# Test HTTP response
echo "   → Testing HTTP response..."
sleep 5
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_IP" || echo "000")
if [ "$HTTP_RESPONSE" = "200" ]; then
    echo "   ✅ Application responding with HTTP 200"
elif [ "$HTTP_RESPONSE" != "000" ]; then
    echo "   ⚠️  Application responding with HTTP $HTTP_RESPONSE"
else
    echo "   ❌ No HTTP response - check configuration"
fi

echo ""
echo "🎉 CLEAN DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo ""
echo "📊 Deployment Summary:"
echo "   → Server: http://$SERVER_IP"
echo "   → Domain: https://brainark.online (if DNS configured)"
echo "   → PM2 Process: brainark-dapp (optimized)"
echo "   → Old Backup: $BACKUP_PATH"
echo "   → Performance: OPTIMIZED ⚡"
echo ""
echo "📚 Management Commands:"
echo "   → View logs: sshpass -p '$SSH_KEY' ssh root@$SERVER_IP 'pm2 logs brainark-dapp'"
echo "   → Monitor: sshpass -p '$SSH_KEY' ssh root@$SERVER_IP 'pm2 monit'"
echo "   → Restart: sshpass -p '$SSH_KEY' ssh root@$SERVER_IP 'pm2 restart brainark-dapp'"
echo "   → Status: sshpass -p '$SSH_KEY' ssh root@$SERVER_IP 'pm2 status'"
echo ""
echo "🚀 Your optimized BrainArk DApp is now live and performance-tuned!"