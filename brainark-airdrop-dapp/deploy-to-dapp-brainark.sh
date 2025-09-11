#!/bin/bash

# ================================================================================================
# BRAINARK DAPP PRODUCTION DEPLOYMENT TO dapp.brainark.online
# ================================================================================================
# Server: root@84.247.171.69
# Password: n8fXfH8C6Pu0c
# Target: /var/www/brainark-dapp -> dapp.brainark.online
# Updated: 2025-09-02
# ================================================================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
SERVER_USER="root"
SERVER_HOST="84.247.171.69"
SERVER_PASS="n8fXfH8C6Pu0c"
SERVER_PATH="/var/www/brainark-dapp"
DOMAIN="dapp.brainark.online"

print_step() {
    echo -e "${BLUE}🚀 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    print_error "sshpass is required but not installed."
    print_warning "Please install it: sudo apt-get install sshpass"
    exit 1
fi

echo "🚀 DEPLOYING BRAINARK DAPP TO PRODUCTION"
echo "========================================"
echo "Target: https://$DOMAIN"
echo "Server: $SERVER_HOST"
echo ""

# Step 1: Validate environment
print_step "1. Validating environment..."

if [ ! -f "package.json" ]; then
    print_error "package.json not found! Run from brainark-airdrop-dapp directory"
    exit 1
fi

if [ ! -f ".env.production" ]; then
    print_error ".env.production not found!"
    exit 1
fi

print_success "Environment validation passed"

# Step 2: Prepare for build
print_step "2. Preparing for production build..."

# Use production environment
cp .env.production .env.local

# Configure next.config.js for static export
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['wagmi', 'viem'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  experimental: {
    esmExternals: 'loose',
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}
module.exports = nextConfig
EOF

print_success "Build configuration ready"

# Step 3: Clean and install
print_step "3. Installing dependencies..."

rm -rf .next out node_modules/.cache
npm install

if [ $? -ne 0 ]; then
    print_error "npm install failed"
    exit 1
fi

print_success "Dependencies installed"

# Step 4: Build application
print_step "4. Building application..."

export NODE_ENV=production
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed"
    exit 1
fi

if [ ! -d "out" ]; then
    print_error "Static export failed - no 'out' directory"
    exit 1
fi

print_success "Build completed successfully"

# Step 5: Create deployment files
print_step "5. Preparing deployment files..."

# Add deployment optimizations
touch out/.nojekyll

cat > out/robots.txt << EOF
User-agent: *
Allow: /
Sitemap: https://$DOMAIN/sitemap.xml
EOF

# Create index for subdirectories to handle Next.js routing
for dir in out/*/; do
    if [ -d "$dir" ] && [ ! -f "${dir}index.html" ]; then
        cp out/index.html "${dir}index.html" 2>/dev/null || true
    fi
done

print_success "Deployment files prepared"

# Step 6: Deploy to server
print_step "6. Deploying to server..."

echo "Connecting to $SERVER_HOST..."

# Test connection
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "echo 'Connection test successful'"

if [ $? -ne 0 ]; then
    print_error "SSH connection failed"
    exit 1
fi

print_success "SSH connection established"

# Create server directory
print_step "6.1. Creating server directory..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "mkdir -p $SERVER_PATH"

# Upload files
print_step "6.2. Uploading files..."
sshpass -p "$SERVER_PASS" rsync -avz --delete out/ $SERVER_USER@$SERVER_HOST:$SERVER_PATH/

if [ $? -ne 0 ]; then
    print_error "File upload failed"
    exit 1
fi

print_success "Files uploaded successfully"

# Step 7: Configure server
print_step "7. Configuring server..."

sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST << 'EOF'
# Set proper permissions
chown -R www-data:www-data /var/www/brainark-dapp
chmod -R 755 /var/www/brainark-dapp
find /var/www/brainark-dapp -type f -exec chmod 644 {} \;

# Create or update Nginx configuration
cat > /etc/nginx/sites-available/dapp.brainark.online << 'NGINX_EOF'
server {
    listen 80;
    listen [::]:80;
    server_name dapp.brainark.online;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name dapp.brainark.online;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/brainark.crt;
    ssl_certificate_key /etc/ssl/private/brainark.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/brainark-dapp;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle Next.js routing
    location / {
        try_files $uri $uri.html $uri/ /index.html;
    }

    # Handle API routes
    location /api {
        try_files $uri $uri/ =404;
    }

    error_page 404 /404.html;
}
NGINX_EOF

# Enable the site
ln -sf /etc/nginx/sites-available/dapp.brainark.online /etc/nginx/sites-enabled/

# Remove default site if it exists
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t && systemctl reload nginx

echo "Server configuration completed"
EOF

if [ $? -ne 0 ]; then
    print_error "Server configuration failed"
    exit 1
fi

print_success "Server configured successfully"

# Step 8: Verify deployment
print_step "8. Verifying deployment..."

sleep 3

# Test HTTP response
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN/ || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ]; then
    print_success "Site is responding (HTTP $HTTP_CODE)"
else
    print_warning "Site response: HTTP $HTTP_CODE"
fi

# Step 9: Cleanup
print_step "9. Cleaning up..."

rm -f .env.local
git checkout next.config.js 2>/dev/null || echo "No git repo found"

print_success "Cleanup completed"

# Final summary
echo ""
echo "🎉 DEPLOYMENT COMPLETED!"
echo "========================="
echo ""
echo -e "${GREEN}🌐 Live URL: http://$DOMAIN${NC}"
echo -e "${GREEN}🔒 HTTPS: https://$DOMAIN${NC}"
echo -e "${GREEN}📁 Server: $SERVER_PATH${NC}"
echo ""
echo "📋 Deployed Features:"
echo "  ✅ EPO Contract Integration"
echo "  ✅ Airdrop System with Appwrite"
echo "  ✅ Multi-network Treasury Support"
echo "  ✅ WalletConnect & Mobile Optimization"
echo "  ✅ Twitter API Integration"
echo "  ✅ Production Environment"
echo ""
echo "🔍 Contract Addresses:"
echo "  EPO: 0xdE04886D4e89f48F73c1684f2e610b25D561DD48"
echo "  Airdrop: 0x1Df35D8e45E0192cD3C25B007a5417b2235642E5"
echo "  Funding: 0xc9dE877a53f85BF51D76faed0C8c8842EFb35782"
echo ""
echo "🚀 Next Steps:"
echo "  1. Visit https://$DOMAIN to test the deployment"
echo "  2. Test wallet connections and transactions"
echo "  3. Verify social media integrations"
echo "  4. Clear browser cache if needed (Ctrl+F5)"
echo ""
print_success "Deployment script completed!"

# Optional: Open browser
if command -v xdg-open &> /dev/null; then
    read -p "Open https://$DOMAIN in browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        xdg-open "https://$DOMAIN"
    fi
fi