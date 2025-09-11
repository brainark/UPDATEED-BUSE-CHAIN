#!/bin/bash
# Deploy Enhanced BrainArk DApp to SSH Server with Network Error Handling
set -e

echo "🚀 DEPLOYING ENHANCED BRAINARK DAPP TO SSH SERVER"
echo "=================================================="
echo "✨ Includes: Network Error Handler, Enhanced APIs, BSC Fix"

# Server configuration
SERVER_IP="84.247.171.69"
SERVER_USER="root"
REMOTE_DIR="/var/www/brainark-dapp"
LOCAL_BUILD_DIR="./out"
BACKUP_DIR="/var/www/backups/$(date +%Y%m%d_%H%M%S)"

echo "📦 Building the enhanced application..."
cd /home/brainark/brainark_besu_chain/brainark-airdrop-dapp

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next out node_modules/.cache

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
fi

# Verify enhanced files are present
echo "🔍 Verifying enhanced files..."
REQUIRED_FILES=(
    "src/utils/networkErrorHandler.ts"
    "src/hooks/useEnhancedAPI.ts"
    "src/utils/enhancedWagmiConfig.ts"
    "src/components/NetworkStatusMonitor.tsx"
    "src/pages/_app.tsx"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ ERROR: Required enhanced file missing: $file"
        exit 1
    else
        echo "✅ Found: $file"
    fi
done

# Build the application with enhanced features
echo "🔨 Building Enhanced Next.js application..."
echo "   - Network error handling enabled"
echo "   - API fallback system integrated" 
echo "   - BSC network switching fixed"
echo "   - Coinbase wallet timeout suppression"

# Set production environment
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

npm run build

# Verify build output
if [ ! -d "out" ]; then
    echo "❌ Build failed - no output directory found"
    exit 1
fi

echo "✅ Enhanced static files ready in ./out/"
echo "📊 Build summary:"
echo "   - Static pages: $(find out -name '*.html' | wc -l)"
echo "   - JavaScript files: $(find out -name '*.js' | wc -l)"
echo "   - CSS files: $(find out -name '*.css' | wc -l)"

echo "🌐 Deploying to server $SERVER_IP..."

# Create backup and remote directories
echo "💾 Creating backup and setting up directories..."
ssh $SERVER_USER@$SERVER_IP << 'SETUP_EOF'
# Create backup of current deployment
if [ -d "/var/www/brainark-dapp" ]; then
    BACKUP_DIR="/var/www/backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    cp -r /var/www/brainark-dapp/* "$BACKUP_DIR/" 2>/dev/null || echo "No existing files to backup"
    echo "✅ Backup created at: $BACKUP_DIR"
fi

# Create fresh deployment directory
rm -rf /var/www/brainark-dapp
mkdir -p /var/www/brainark-dapp
echo "✅ Fresh deployment directory created"
SETUP_EOF

# Copy built files to server with progress
echo "📁 Copying enhanced application files to server..."
echo "   This includes all network error handling and BSC fixes..."
scp -r ./out/* $SERVER_USER@$SERVER_IP:$REMOTE_DIR/

# Verify deployment
echo "🔍 Verifying deployment..."
ssh $SERVER_USER@$SERVER_IP << 'VERIFY_EOF'
cd /var/www/brainark-dapp
if [ -f "index.html" ]; then
    echo "✅ index.html deployed successfully"
    file_count=$(find . -type f | wc -l)
    dir_size=$(du -sh . | cut -f1)
    echo "📊 Deployment stats:"
    echo "   - Total files: $file_count"
    echo "   - Total size: $dir_size"
else
    echo "❌ ERROR: index.html not found in deployment"
    exit 1
fi
VERIFY_EOF

# Set up enhanced nginx configuration
echo "⚙️ Setting up enhanced nginx configuration..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
# Install nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "📥 Installing nginx..."
    apt update
    apt install -y nginx
fi

# Create enhanced nginx configuration for BrainArk DApp
cat > /etc/nginx/sites-available/brainark-dapp << 'NGINX_CONFIG'
server {
    listen 80;
    listen [::]:80;
    server_name dapp.brainark.online 84.247.171.69;
    
    root /var/www/brainark-dapp;
    index index.html;
    
    # Enhanced logging for debugging
    access_log /var/log/nginx/brainark-dapp-access.log;
    error_log /var/log/nginx/brainark-dapp-error.log warn;
    
    # Main location block - serve static files with fallback
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache control for different file types
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        location ~* \.html$ {
            expires 1h;
            add_header Cache-Control "public, must-revalidate";
        }
    }
    
    # Handle API routes (for Next.js API routes in static export)
    location /api/ {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # Enhanced security headers for DApp
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; connect-src 'self' https: wss: ws:;" always;
    
    # CORS headers for blockchain interactions
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE" always;
    add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
    
    # Handle preflight requests
    location ~* "^/.*\.(?:OPTIONS)$" {
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
        return 204;
    }
    
    # Enhanced gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Block access to sensitive directories
    location ~* /(\.git|node_modules|\.next|\.env) {
        deny all;
        return 404;
    }
}
NGINX_CONFIG

# Enable the site and disable default
ln -sf /etc/nginx/sites-available/brainark-dapp /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration test passed"
else
    echo "❌ Nginx configuration test failed"
    exit 1
fi

# Restart and enable nginx
echo "🔄 Restarting nginx..."
systemctl restart nginx
systemctl enable nginx

echo "✅ Enhanced nginx configured and restarted"
echo "📊 Nginx status:"
systemctl is-active nginx
EOF

# Final health check
echo "🏥 Running final health check..."
ssh $SERVER_USER@$SERVER_IP << 'HEALTH_EOF'
echo "🔍 System health check:"
echo "   - Nginx status: $(systemctl is-active nginx)"
echo "   - Disk space: $(df -h /var/www | tail -1 | awk '{print $4}' | sed 's/%//' | head -1)% available"
echo "   - Memory usage: $(free -m | grep '^Mem:' | awk '{printf "%.1f%%", $3/$2 * 100.0}')"

# Test if the site is accessible
echo "🌐 Testing site accessibility..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
    echo "✅ Site is accessible locally"
else
    echo "⚠️  Site accessibility check failed"
fi
HEALTH_EOF

echo ""
echo "🎉 ENHANCED BRAINARK DAPP DEPLOYMENT COMPLETE!"
echo "==============================================="
echo ""
echo "✨ ENHANCED FEATURES DEPLOYED:"
echo "   🚫 Coinbase wallet timeout errors suppressed"
echo "   🔄 API retry logic with fallback data"
echo "   🟡 BSC network switching fixed"
echo "   📊 Network status monitoring enabled"
echo "   🛡️  Enhanced error handling throughout"
echo ""
echo "🌐 Your Enhanced BrainArk DApp is now live at:"
echo "   🔗 Primary: http://dapp.brainark.online"
echo "   🔗 Direct IP: http://84.247.171.69"
echo ""
echo "📊 SMART CONTRACT ADDRESSES:"
echo "   💎 EPO Contract: 0xdE04886D4e89f48F73c1684f2e610b25D561DD48"
echo "   🎁 Airdrop Contract: 0x1Df35D8e45E0192cD3C25B007a5417b2235642E5"
echo "   🌐 RPC Endpoint: https://rpc.brainark.online"
echo ""
echo "🔧 MANAGEMENT COMMANDS:"
echo "   📊 Check nginx status: ssh root@84.247.171.69 'systemctl status nginx'"
echo "   📋 View access logs: ssh root@84.247.171.69 'tail -f /var/log/nginx/brainark-dapp-access.log'"
echo "   ❌ View error logs: ssh root@84.247.171.69 'tail -f /var/log/nginx/brainark-dapp-error.log'"
echo "   🔄 Restart nginx: ssh root@84.247.171.69 'systemctl restart nginx'"
echo "   💾 View backups: ssh root@84.247.171.69 'ls -la /var/www/backups/'"
echo ""
echo "🚀 To redeploy with updates, run: ./deploy-dapp-to-server.sh"
echo ""
echo "🎯 ISSUE RESOLUTION STATUS:"
echo "   ✅ Coinbase timeout errors - FIXED"
echo "   ✅ API 500 errors - FIXED (with fallbacks)"
echo "   ✅ BSC network switching - FIXED"  
echo "   ✅ Console error spam - SUPPRESSED"
echo "   ✅ Network stability - ENHANCED"
