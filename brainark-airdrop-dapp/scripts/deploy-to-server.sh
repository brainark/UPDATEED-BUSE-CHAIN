#!/bin/bash

# BrainArk DApp Server Deployment Script
# This script deploys your DApp to your public server

echo "🚀 Starting BrainArk DApp Server Deployment..."
echo "================================================"

# Configuration
SERVER_USER="root"  # Update with your server username
SERVER_HOST="brainark.online"  # Update with your server IP/domain
SERVER_PATH="/var/www/brainark-dapp"  # Update with your server path
LOCAL_BUILD_PATH="./out"  # Next.js static export path

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Step 1: Environment Check
echo ""
print_info "Step 1: Checking environment..."

if [ ! -f ".env.local" ]; then
    print_error ".env.local file not found!"
    exit 1
fi

if [ ! -f "package.json" ]; then
    print_error "package.json not found! Are you in the right directory?"
    exit 1
fi

print_status "Environment check passed"

# Step 2: Update environment for production
echo ""
print_info "Step 2: Updating environment for production..."

# Create production environment file
cp .env.local .env.production

# Update production-specific variables
sed -i 's/NEXT_PUBLIC_NETWORK_ENV=development/NEXT_PUBLIC_NETWORK_ENV=production/' .env.production
sed -i 's|NEXT_PUBLIC_RPC_URL=http://localhost:8545|NEXT_PUBLIC_RPC_URL=https://rpc.brainark.online|' .env.production
sed -i 's|NEXTAUTH_URL=http://localhost:3000|NEXTAUTH_URL=https://brainark.online|' .env.production

print_status "Production environment configured"

# Step 3: Install dependencies
echo ""
print_info "Step 3: Installing dependencies..."

npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

print_status "Dependencies installed"

# Step 4: Build the application
echo ""
print_info "Step 4: Building application for production..."

# Set production environment
export NODE_ENV=production
export NEXT_PUBLIC_NETWORK_ENV=production

# Build the application
npm run build
if [ $? -ne 0 ]; then
    print_error "Build failed"
    exit 1
fi

# Export static files (if using static export)
npm run export 2>/dev/null || echo "Static export not configured, using build output"

print_status "Application built successfully"

# Step 5: Prepare deployment files
echo ""
print_info "Step 5: Preparing deployment files..."

# Create deployment directory
mkdir -p deploy

# Copy build files
if [ -d "out" ]; then
    cp -r out/* deploy/
    print_status "Static export files copied"
elif [ -d ".next" ]; then
    cp -r .next deploy/
    cp -r public deploy/
    cp package.json deploy/
    cp .env.production deploy/.env.local
    print_status "Next.js build files copied"
else
    print_error "No build output found"
    exit 1
fi

# Copy additional files
cp server-config.js deploy/ 2>/dev/null || echo "server-config.js not found, skipping"
cp -r scripts deploy/ 2>/dev/null || echo "scripts directory not found, skipping"

print_status "Deployment files prepared"

# Step 6: Deploy to server
echo ""
print_info "Step 6: Deploying to server..."

print_warning "Make sure you have SSH access to $SERVER_HOST"
print_info "Deploying to: $SERVER_USER@$SERVER_HOST:$SERVER_PATH"

# Create server directory
ssh $SERVER_USER@$SERVER_HOST "mkdir -p $SERVER_PATH"

# Upload files
rsync -avz --delete deploy/ $SERVER_USER@$SERVER_HOST:$SERVER_PATH/

if [ $? -ne 0 ]; then
    print_error "Failed to upload files to server"
    exit 1
fi

print_status "Files uploaded to server"

# Step 7: Server setup
echo ""
print_info "Step 7: Setting up server environment..."

ssh $SERVER_USER@$SERVER_HOST << EOF
    cd $SERVER_PATH
    
    # Install Node.js if not present
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Install PM2 for process management
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
    fi
    
    # Install dependencies if package.json exists
    if [ -f "package.json" ]; then
        npm install --production
    fi
    
    # Set up nginx configuration (if nginx is installed)
    if command -v nginx &> /dev/null; then
        echo "Nginx detected, you may need to configure it manually"
    fi
    
    echo "Server setup completed"
EOF

print_status "Server environment configured"

# Step 8: Start the application
echo ""
print_info "Step 8: Starting application..."

if [ -f "deploy/package.json" ]; then
    # Node.js application
    ssh $SERVER_USER@$SERVER_HOST << EOF
        cd $SERVER_PATH
        
        # Stop existing process
        pm2 stop brainark-dapp 2>/dev/null || true
        pm2 delete brainark-dapp 2>/dev/null || true
        
        # Start new process
        pm2 start npm --name "brainark-dapp" -- start
        pm2 save
        pm2 startup
        
        echo "Application started with PM2"
EOF
else
    # Static files
    print_info "Static files deployed. Configure your web server to serve from $SERVER_PATH"
fi

print_status "Application deployment completed"

# Step 9: Verification
echo ""
print_info "Step 9: Verifying deployment..."

# Test server response
sleep 5
if curl -s -o /dev/null -w "%{http_code}" https://$SERVER_HOST | grep -q "200\|301\|302"; then
    print_status "Server is responding"
else
    print_warning "Server may not be responding yet. Check your web server configuration."
fi

# Step 10: Cleanup
echo ""
print_info "Step 10: Cleaning up..."

rm -rf deploy
rm -f .env.production

print_status "Cleanup completed"

# Final summary
echo ""
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "====================================="
echo ""
print_info "Your BrainArk DApp has been deployed to:"
echo "🌐 URL: https://$SERVER_HOST"
echo "📁 Path: $SERVER_PATH"
echo ""
print_info "Next steps:"
echo "1. Configure your web server (nginx/apache) if using static files"
echo "2. Set up SSL certificates for HTTPS"
echo "3. Configure domain DNS records"
echo "4. Test all functionality:"
echo "   - Wallet connections"
echo "   - EPO purchases"
echo "   - Airdrop participation"
echo "   - Treasury routing"
echo ""
print_info "Contract addresses:"
echo "📄 EPO Contract: $(grep NEXT_PUBLIC_EPO_CONTRACT .env.local | cut -d'=' -f2)"
echo "🎁 Airdrop Contract: $(grep NEXT_PUBLIC_AIRDROP_CONTRACT .env.local | cut -d'=' -f2)"
echo "💰 Funding Wallet: $(grep NEXT_PUBLIC_FUNDING_WALLET .env.local | cut -d'=' -f2)"
echo ""
print_status "Deployment script completed!"

# Optional: Open browser
if command -v xdg-open &> /dev/null; then
    read -p "Open https://$SERVER_HOST in browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        xdg-open "https://$SERVER_HOST"
    fi
fi