#!/bin/bash
# Update BrainArk DApp to use existing domain and SSL setup
set -e

echo "🔄 UPDATING BRAINARK DAPP ON EXISTING DOMAIN"
echo "============================================="

SERVER_IP="84.247.171.69"
SERVER_USER="root"

echo "📦 Moving deployment to existing directory..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
# Backup existing brainark-dapp
if [ -d "/var/www/brainark-dapp" ]; then
    echo "📂 Backing up existing brainark-dapp..."
    mv /var/www/brainark-dapp /var/www/brainark-dapp-backup-$(date +%Y%m%d-%H%M%S)
fi

# Move new deployment to correct location
echo "🔄 Moving new deployment..."
mv /var/www/brainark /var/www/brainark-dapp

echo "✅ Files moved successfully"
EOF

echo "⚙️ Updating nginx configuration for dapp.brainark.online..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
# Create updated nginx configuration for static files
cat > /etc/nginx/sites-available/brainark-dapp << 'NGINX_CONFIG'
server {
    server_name dapp.brainark.online;
    
    root /var/www/brainark-dapp;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Handle API routes (for client-side routing)
    location /api/ {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/dapp.brainark.online/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/dapp.brainark.online/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = dapp.brainark.online) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name dapp.brainark.online;
    return 404; # managed by Certbot
}
NGINX_CONFIG

# Test nginx configuration
nginx -t

# Reload nginx
systemctl reload nginx

echo "✅ Nginx configuration updated and reloaded"
EOF

echo ""
echo "🎉 DAPP UPDATE COMPLETE!"
echo "======================="
echo "🌐 Your BrainArk DApp is now live at:"
echo "   https://dapp.brainark.online"
echo ""
echo "📊 Contract Addresses:"
echo "   EPO Contract: 0xdE04886D4e89f48F73c1684f2e610b25D561DD48"
echo "   Airdrop Contract: 0x1Df35D8e45E0192cD3C25B007a5417b2235642E5"
echo "   RPC: https://rpc.brainark.online"
echo ""
echo "🔒 SSL Certificate: ✅ Active (Let's Encrypt)"
echo "🔧 To check status: ssh root@84.247.171.69 'systemctl status nginx'"
