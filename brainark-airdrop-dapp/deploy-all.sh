#!/bin/bash
set -e

SERVER_USER="brainark"
SERVER_HOST="brainark.online"
SERVER_DIR="/var/www/brainark"
NETWORK_NAME="brainark" # hardhat.config.js network name

print_info() {
    echo -e "\n\033[1;34m$1\033[0m\n"
}

# Step 0: Deploy smart contracts
print_info "🚀 Deploying BrainArk Contracts to Besu..."
DEPLOY_OUTPUT=$(npx hardhat run scripts/deploy.js --network $NETWORK_NAME)
echo "$DEPLOY_OUTPUT"

# Extract contract addresses from deploy.js output
AIRDROP_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "BrainArkAirdrop deployed at" | awk '{print $NF}')
EPO_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "BrainArkEPO deployed at" | awk '{print $NF}')

if [[ -z "$AIRDROP_ADDRESS" || -z "$EPO_ADDRESS" ]]; then
    echo "❌ Failed to retrieve contract addresses. Check deploy.js output."
    exit 1
fi

print_info "📄 Updating .env.local with new contract addresses..."
sed -i "s/^NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS=.*/NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS=$AIRDROP_ADDRESS/" .env.local
sed -i "s/^NEXT_PUBLIC_EPO_CONTRACT_ADDRESS=.*/NEXT_PUBLIC_EPO_CONTRACT_ADDRESS=$EPO_ADDRESS/" .env.local

# Step 1: Build Next.js DApp
print_info "🏗 Building Next.js frontend..."
npm install
npm run build

# Step 2: Push build to server
print_info "📤 Deploying frontend to $SERVER_HOST..."
rsync -avz --delete .next public package.json $SERVER_USER@$SERVER_HOST:$SERVER_DIR

# Step 3: Install & restart PM2 on server
print_info "🔄 Restarting PM2 on server..."
ssh $SERVER_USER@$SERVER_HOST << EOF
    cd $SERVER_DIR
    npm install --production
    pm2 delete brainark-frontend || true
    pm2 start npm --name "brainark-frontend" -- start
    pm2 save
EOF

print_info "✅ Deployment complete!  
🌍 Frontend: https://brainark.online  
🪙 Airdrop: $AIRDROP_ADDRESS  
💰 EPO: $EPO_ADDRESS"
