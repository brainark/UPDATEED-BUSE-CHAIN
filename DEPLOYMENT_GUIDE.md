# 🚀 BrainArk Explorer Deployment Guide

This guide will help you deploy your BrainArk blockchain explorer to make it publicly accessible.

## 🎯 Recommended Deployment Strategy

### **Hybrid Approach (RECOMMENDED)**
- **Blockchain Nodes**: Host on your server (brainark.online)
- **Explorer Frontend**: Deploy on Vercel with custom domain
- **Benefits**: Professional, scalable, cost-effective

## 📋 Prerequisites

1. **Domain**: brainark.online (you own this)
2. **Server**: For hosting blockchain nodes
3. **Git Repository**: Already set up
4. **Vercel Account**: Free tier available

## 🌐 Option 1: Deploy to Vercel (Recommended for Frontend)

### Step 1: Prepare for Vercel Deployment

```bash
# Navigate to your project
cd /home/brainark/brainark_besu_chain

# Create a separate directory for Vercel deployment
mkdir vercel-deployment
cp -r brainarkblock-explorer/* vercel-deployment/

# Rename production files to main files
cd vercel-deployment
mv index-production.html index.html
mv explorer-production.js explorer.js
mv style-production.css style.css
```

### Step 2: Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd vercel-deployment
   vercel --prod
   ```

4. **Configure Custom Domain:**
   - Go to Vercel Dashboard
   - Select your project
   - Go to Settings → Domains
   - Add `explorer.brainark.online`

### Step 3: Update DNS Records

Add these DNS records to your domain:

```
Type: CNAME
Name: explorer
Value: cname.vercel-dns.com
```

## 🖥️ Option 2: Deploy to Your Server (brainark.online)

### Step 1: Set Up Server Infrastructure

```bash
# On your server (brainark.online)
sudo apt update
sudo apt install nginx docker docker-compose certbot python3-certbot-nginx

# Create directory for the explorer
sudo mkdir -p /var/www/explorer.brainark.online
```

### Step 2: Upload Explorer Files

```bash
# From your local machine
scp -r brainarkblock-explorer/* user@brainark.online:/var/www/explorer.brainark.online/

# Rename production files on server
ssh user@brainark.online
cd /var/www/explorer.brainark.online
mv index-production.html index.html
mv explorer-production.js explorer.js
mv style-production.css style.css
```

### Step 3: Configure Nginx

Create `/etc/nginx/sites-available/explorer.brainark.online`:

```nginx
server {
    listen 80;
    server_name explorer.brainark.online;
    root /var/www/explorer.brainark.online;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/explorer.brainark.online /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: Set Up SSL

```bash
sudo certbot --nginx -d explorer.brainark.online
```

## 🔗 Option 3: Set Up RPC Endpoint

### For Production Blockchain Access

1. **Configure Nginx for RPC:**

Create `/etc/nginx/sites-available/rpc.brainark.online`:

```nginx
server {
    listen 80;
    server_name rpc.brainark.online;

    location / {
        proxy_pass http://localhost:8545;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type";
    }
}
```

2. **Enable and secure:**
```bash
sudo ln -s /etc/nginx/sites-available/rpc.brainark.online /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d rpc.brainark.online
```

## 🔧 Configuration Updates

### Update Explorer Configuration

In your production explorer files, update the RPC URL:

```javascript
// In explorer-production.js
const PRODUCTION_CONFIG = {
  RPC_URL: "https://rpc.brainark.online",  // Your RPC endpoint
  CHAIN_ID: "0x67932",
  CHAIN_NAME: "BrainArk Chain",
  EXPLORER_URL: "https://explorer.brainark.online",
  // ... rest of config
};
```

## 📊 Monitoring and Maintenance

### 1. Set Up Monitoring

```bash
# Monitor blockchain nodes
docker logs besu-node1 --tail 100 -f

# Monitor nginx access
sudo tail -f /var/log/nginx/access.log

# Monitor SSL certificates
sudo certbot certificates
```

### 2. Automated Backups

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backup/brainark_explorer_$DATE.tar.gz /var/www/explorer.brainark.online
```

## 🚀 Quick Deployment Commands

### For Vercel (Fastest):
```bash
cd brainarkblock-explorer
npx vercel --prod
```

### For Your Server:
```bash
# Upload files
scp -r brainarkblock-explorer/* user@brainark.online:/var/www/explorer.brainark.online/

# Configure nginx and SSL
ssh user@brainark.online
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d explorer.brainark.online
```

## 🔍 Testing Your Deployment

1. **Check Explorer Access:**
   ```bash
   curl -I https://explorer.brainark.online
   ```

2. **Test RPC Endpoint:**
   ```bash
   curl -X POST -H "Content-Type: application/json" \
     --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
     https://rpc.brainark.online
   ```

3. **Verify SSL:**
   ```bash
   openssl s_client -connect explorer.brainark.online:443 -servername explorer.brainark.online
   ```

## 🎉 Final Steps

1. **Update DNS records** for your subdomains
2. **Test all functionality** in production
3. **Monitor logs** for any issues
4. **Share your explorer** with the community!

Your BrainArk explorer will be accessible at:
- **Explorer**: https://explorer.brainark.online
- **RPC**: https://rpc.brainark.online

## 🆘 Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure nginx CORS headers are set
2. **SSL Issues**: Check certbot configuration
3. **RPC Connection**: Verify blockchain nodes are running
4. **DNS Propagation**: Wait 24-48 hours for full propagation

### Support:
- Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- Verify blockchain status: `docker ps | grep besu`
- Test local connectivity: `curl http://localhost:8545`