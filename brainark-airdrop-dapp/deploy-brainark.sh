#!/bin/bash

# BrainArk DApp Deployment Script - Fixed SSL for Subdomain
# Version: SSL_FIX_1.0

set -e  # Exit on any error

# Configuration
SERVER_IP="84.247.171.69"
SERVER_USER="root"
DOMAIN="dapp.brainark.online"  # DApp subdomain
APP_NAME="brainark-dapp"
EMAIL="admin@brainark.online"  # Change this to your email

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

run_remote() {
    ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "$1"
}

copy_to_remote() {
    scp -o StrictHostKeyChecking=no -r "$1" $SERVER_USER@$SERVER_IP:"$2"
}

# Test server connection
test_connection() {
    print_status "Testing connection to server..."
    if run_remote "echo 'Connection successful'"; then
        print_success "Server connection established"
    else
        print_error "Cannot connect to server $SERVER_IP"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing system dependencies..."
    
    run_remote "
        apt update
        apt install -y curl git nginx certbot python3-certbot-nginx
        
        # Install Node.js 18
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt install -y nodejs
        
        # Install PM2
        npm install -g pm2
        
        print_success 'Dependencies installed successfully'
    "
}

# Deploy application
deploy_app() {
    print_status "Deploying BrainArk DApp..."
    
    # Create application directory
    run_remote "
        mkdir -p /var/www/$APP_NAME
        cd /var/www/$APP_NAME
        
        # Stop existing PM2 processes
        pm2 stop $APP_NAME 2>/dev/null || true
        pm2 delete $APP_NAME 2>/dev/null || true
        
        # Remove old files
        rm -rf * .[^.]*
    "
    
    # Copy application files
    print_status "Copying application files..."
    copy_to_remote "./" "/var/www/$APP_NAME/"
    
    # Install dependencies and build
    run_remote "
        cd /var/www/$APP_NAME
        
        # Install npm dependencies
        npm install
        
        # Create environment file
        cat > .env.local << 'EOF'
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$(openssl rand -base64 32)
DATABASE_URL=file:./dev.db
NODE_ENV=production
EOF
        
        # Build the application
        npm run build
        
        # Set permissions
        chown -R www-data:www-data /var/www/$APP_NAME
        chmod -R 755 /var/www/$APP_NAME
    "
}

# Configure Nginx
configure_nginx() {
    print_status "Configuring Nginx for subdomain..."
    
    run_remote "
        # Remove default nginx site
        rm -f /etc/nginx/sites-enabled/default
        
        # Create Nginx configuration for subdomain
        cat > /etc/nginx/sites-available/$APP_NAME << 'EOF'
server {
    listen 80;
    server_name $DOMAIN;
    
    # Redirect all HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    # SSL Configuration (will be updated by certbot)
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection \"1; mode=block\";
    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains; preload\";
    
    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_comp_level 9;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
        
        # Enable the site
        ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
        
        # Test nginx configuration
        nginx -t
        
        # Reload nginx
        systemctl reload nginx
    "
}

# Setup SSL certificate for subdomain
setup_ssl() {
    print_status "Setting up SSL certificate for subdomain..."
    
    run_remote "
        # Wait for DNS propagation
        echo 'Waiting for DNS propagation...'
        sleep 30
        
        # Test if domain resolves to this server
        if nslookup $DOMAIN | grep -q '$SERVER_IP'; then
            echo 'DNS resolution confirmed'
        else
            echo 'Warning: DNS may not be fully propagated yet'
        fi
        
        # Install SSL certificate for subdomain specifically
        certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect
        
        # Verify certificate installation
        if certbot certificates | grep -q '$DOMAIN'; then
            echo 'SSL certificate installed successfully'
        else
            echo 'SSL certificate installation may have failed'
        fi
        
        # Reload nginx with new SSL config
        systemctl reload nginx
    "
}

# Start application with PM2
start_app() {
    print_status "Starting application with PM2..."
    
    run_remote "
        cd /var/www/$APP_NAME
        
        # Start with PM2
        pm2 start npm --name '$APP_NAME' -- start
        pm2 save
        pm2 startup
        
        # Show PM2 status
        pm2 status
    "
}

# Test deployment
test_deployment() {
    print_status "Testing deployment..."
    
    run_remote "
        # Test internal connection
        sleep 10
        curl -s http://localhost:3000 > /dev/null && echo 'Internal connection: OK' || echo 'Internal connection: FAILED'
        
        # Test SSL certificate
        echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null && echo 'SSL certificate: OK' || echo 'SSL certificate: FAILED'
    "
    
    print_status "Testing external access..."
    sleep 15
    
    if curl -s -k https://$DOMAIN > /dev/null; then
        print_success "External HTTPS access: OK"
    else
        print_warning "External HTTPS access: May need more time for DNS propagation"
    fi
}

# Main deployment function
main() {
    echo "🚀 BrainArk DApp Deployment (SSL Subdomain Fix)"
    echo "=============================================="
    echo "Domain: $DOMAIN"
    echo "Server: $SERVER_IP"
    echo ""
    
    test_connection
    install_dependencies
    deploy_app
    configure_nginx
    setup_ssl
    start_app
    test_deployment
    
    echo ""
    echo "🎉 Deployment Complete!"
    echo "========================"
    echo "🌐 Your DApp is now available at:"
    echo "   📱 https://dapp.brainark.online"
    echo ""
    echo "🔍 Your Complete BrainArk Ecosystem:"
    echo "   📊 Blockchain Explorer: https://brainark.online"
    echo "   🚀 DApp: https://dapp.brainark.online"
    echo "   🔗 RPC: https://rpc.brainark.online"
    echo ""
    echo "✅ SSL Certificate Status:"
    run_remote "certbot certificates | grep -A 10 '$DOMAIN' || echo 'Certificate check failed'"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Wait 5-10 minutes for full SSL propagation"
    echo "   2. Visit https://dapp.brainark.online"
    echo "   3. Test all DApp functionality"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   • If still showing 'Not Secure', wait longer for SSL"
    echo "   • Check DNS: nslookup dapp.brainark.online"
    echo "   • View logs: ssh root@$SERVER_IP 'pm2 logs $APP_NAME'"
}

# Run the deployment
