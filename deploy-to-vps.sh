#!/bin/bash

echo "🚀 BrainArk Blockchain VPS Deployment Script"
echo "============================================"

# Configuration
VPS_IP=""
VPS_USER="root"
DOMAIN="brainark.online"
RPC_SUBDOMAIN="rpc"

echo ""
echo "📋 Pre-deployment Checklist:"
echo "1. VPS created and accessible via SSH"
echo "2. Domain DNS configured"
echo "3. SSH key authentication setup"
echo ""

read -p "Enter your VPS IP address: " VPS_IP
read -p "Enter VPS username (default: root): " VPS_USER_INPUT
VPS_USER=${VPS_USER_INPUT:-$VPS_USER}

echo ""
echo "🔧 Deployment Configuration:"
echo "VPS IP: $VPS_IP"
echo "User: $VPS_USER"
echo "Domain: $DOMAIN"
echo "RPC Endpoint: $RPC_SUBDOMAIN.$DOMAIN"
echo ""

read -p "Continue with deployment? (y/N): " confirm
if [[ $confirm != [yY] ]]; then
    echo "Deployment cancelled."
    exit 1
fi

echo ""
echo "📦 Step 1: Preparing deployment package..."

# Create deployment package
mkdir -p deployment-package
cp -r validators deployment-package/
cp -r config deployment-package/
cp -r docker deployment-package/
cp docker-compose.blockchain.yml deployment-package/
cp -r scripts deployment-package/

# Create VPS setup script
cat > deployment-package/setup-vps.sh << 'EOF'
#!/bin/bash

echo "🔧 Setting up VPS for BrainArk Blockchain..."

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable docker
systemctl start docker

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Nginx
apt install nginx -y
systemctl enable nginx

# Install Certbot for SSL
apt install certbot python3-certbot-nginx -y

# Create blockchain directory
mkdir -p /opt/brainark-blockchain
cd /opt/brainark-blockchain

echo "✅ VPS setup completed!"
EOF

# Create Nginx configuration
cat > deployment-package/nginx-rpc.conf << EOF
server {
    listen 80;
    server_name $RPC_SUBDOMAIN.$DOMAIN;

    location / {
        proxy_pass http://localhost:8545;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
        
        if (\$request_method = 'OPTIONS') {
            return 204;
        }
    }
}
EOF

# Create deployment script for VPS
cat > deployment-package/deploy-blockchain.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploying BrainArk Blockchain..."

# Copy files to blockchain directory
cp -r * /opt/brainark-blockchain/
cd /opt/brainark-blockchain

# Set permissions
chmod +x validators/*/startup.sh
chmod +x scripts/*.sh

# Start blockchain
docker-compose -f docker-compose.blockchain.yml up -d

# Wait for nodes to start
echo "⏳ Waiting for blockchain nodes to start..."
sleep 30

# Check node status
echo "📊 Checking node status..."
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545

echo "✅ Blockchain deployment completed!"
EOF

# Create SSL setup script
cat > deployment-package/setup-ssl.sh << EOF
#!/bin/bash

echo "🔒 Setting up SSL certificate..."

# Copy Nginx configuration
cp nginx-rpc.conf /etc/nginx/sites-available/$RPC_SUBDOMAIN.$DOMAIN
ln -s /etc/nginx/sites-available/$RPC_SUBDOMAIN.$DOMAIN /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

# Get SSL certificate
certbot --nginx -d $RPC_SUBDOMAIN.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

echo "✅ SSL setup completed!"
echo "🌐 Your RPC endpoint: https://$RPC_SUBDOMAIN.$DOMAIN"
EOF

chmod +x deployment-package/*.sh

echo "📦 Deployment package created!"
echo ""

echo "📤 Step 2: Uploading to VPS..."
scp -r deployment-package/* $VPS_USER@$VPS_IP:/tmp/

echo ""
echo "🔧 Step 3: Running VPS setup..."
ssh $VPS_USER@$VPS_IP "cd /tmp && chmod +x *.sh && ./setup-vps.sh"

echo ""
echo "🚀 Step 4: Deploying blockchain..."
ssh $VPS_USER@$VPS_IP "cd /tmp && ./deploy-blockchain.sh"

echo ""
echo "🔒 Step 5: Setting up SSL..."
ssh $VPS_USER@$VPS_IP "cd /tmp && ./setup-ssl.sh"

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🌐 Your public RPC endpoint: https://$RPC_SUBDOMAIN.$DOMAIN"
echo "📊 Check status: curl https://$RPC_SUBDOMAIN.$DOMAIN"
echo ""
echo "📝 Next steps:"
echo "1. Update your explorer configuration"
echo "2. Test wallet connections"
echo "3. Setup monitoring"
echo "4. Configure backups"
echo ""
echo "🔧 VPS Management:"
echo "SSH: ssh $VPS_USER@$VPS_IP"
echo "Logs: docker-compose -f /opt/brainark-blockchain/docker-compose.blockchain.yml logs"
echo "Restart: docker-compose -f /opt/brainark-blockchain/docker-compose.blockchain.yml restart"

# Cleanup
rm -rf deployment-package